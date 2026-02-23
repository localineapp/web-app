/**
 * AI Translation endpoint using DeepL
 * POST /api/v1/projects/:projectId/translations/ai-translate
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authenticateRequest, checkProjectAccess, canAccessLocale } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { toDeepLSourceLang, toDeepLTargetLang } from '@/lib/locales';

interface AiTranslateRequest {
  sourceLocaleCode: string;
  termId: string;
}

interface DeepLResponse {
  translations: Array<{ text: string; detected_source_language: string }>;
}

async function translateWithDeepL(
  text: string,
  targetLang: string,
  sourceLang: string | null
): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPL_API_KEY is not configured');
  }

  const baseUrl = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  const body: Record<string, unknown> = {
    text: [text],
    target_lang: targetLang,
  };
  if (sourceLang) {
    body.source_lang = sourceLang;
  }

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepL API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as DeepLResponse;
  return data.translations[0].text;
}

// POST /api/v1/projects/:projectId/translations/ai-translate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const body: AiTranslateRequest = await request.json();

    if (auth.isApiKey) {
      if (auth.projectId !== projectId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      const access = await checkProjectAccess(auth.userId!, projectId);

      if (!access.hasAccess) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Editors can use AI translate only for their assigned locales
      if (access.memberRole === 'editor') {
        if (!canAccessLocale(body.sourceLocaleCode, access.assignedLocales)) {
          return NextResponse.json(
            { error: 'You do not have access to translate this locale' },
            { status: 403 }
          );
        }
      }
    }

    const { sourceLocaleCode, termId } = body;

    if (!sourceLocaleCode || !termId) {
      return NextResponse.json(
        { error: 'sourceLocaleCode and termId are required' },
        { status: 400 }
      );
    }

    // Verify the source locale exists in this project
    const sourceLocale = await prisma.locale.findFirst({
      where: { projectId, code: sourceLocaleCode },
      select: { id: true },
    });

    if (!sourceLocale) {
      return NextResponse.json({ error: 'Source locale not found' }, { status: 404 });
    }

    // Verify the term exists in this project
    const term = await prisma.term.findFirst({
      where: { id: termId, projectId },
      select: { id: true, isLocked: true },
    });

    if (!term) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 });
    }

    // Locked terms require admin role
    if (term.isLocked) {
      if (auth.isApiKey) {
        if (auth.apiKeyRole !== 'admin') {
          return NextResponse.json(
            { error: 'This term is locked and can only be translated by admins' },
            { status: 403 }
          );
        }
      } else {
        const access = await checkProjectAccess(auth.userId!, projectId);
        if (!access.isOwner && access.memberRole !== 'admin') {
          return NextResponse.json(
            { error: 'This term is locked and can only be translated by admins' },
            { status: 403 }
          );
        }
      }
    }

    // Get the source translation value
    const sourceTranslation = await prisma.translation.findFirst({
      where: { termId, localeId: sourceLocale.id },
      select: { value: true },
    });

    if (!sourceTranslation?.value) {
      return NextResponse.json(
        { error: 'No source translation available to translate from' },
        { status: 400 }
      );
    }

    const sourceText = sourceTranslation.value;
    const sourceLang = toDeepLSourceLang(sourceLocaleCode);

    // Get all other locales in this project
    const allLocales = await prisma.locale.findMany({
      where: { projectId, NOT: { code: sourceLocaleCode } },
      select: { id: true, code: true },
    });

    // Find which locales are already missing translations for this term
    const existingTranslations = await prisma.translation.findMany({
      where: {
        termId,
        localeId: { in: allLocales.map((l) => l.id) },
      },
      select: { localeId: true, value: true },
    });

    const existingMap = new Map(existingTranslations.map((t) => [t.localeId, t.value]));

    const localesToTranslate = allLocales.filter((locale) => {
      const existing = existingMap.get(locale.id);
      return !existing; // Only translate if missing
    });

    if (localesToTranslate.length === 0) {
      return NextResponse.json({ data: { translated: 0, skipped: allLocales.length } });
    }

    let translated = 0;
    let skipped = allLocales.length - localesToTranslate.length;

    for (const locale of localesToTranslate) {
      const targetLang = toDeepLTargetLang(locale.code);
      if (!targetLang) {
        skipped++;
        continue;
      }

      try {
        const translatedText = await translateWithDeepL(sourceText, targetLang, sourceLang);

        await prisma.translation.create({
          data: {
            id: uuidv4(),
            termId,
            localeId: locale.id,
            value: translatedText,
          },
        });

        translated++;
      } catch (err) {
        console.error(`AI translate failed for locale ${locale.code}:`, err);
        skipped++;
      }
    }

    return NextResponse.json({ data: { translated, skipped } });
  } catch (error) {
    if (error instanceof Error && error.message.includes('DEEPL_API_KEY')) {
      return NextResponse.json(
        { error: 'AI translation is not configured on this server' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
