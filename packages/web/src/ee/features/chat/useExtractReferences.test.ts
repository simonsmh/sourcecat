import { expect, test } from 'vitest'
import { renderHook } from '@testing-library/react';
import { useExtractReferences } from './useExtractReferences';
import { getFileReferenceId } from '@/features/chat/utils';
import { TextUIPart } from 'ai';

test('useExtractReferences extracts file references from text content', () => {
    const part: TextUIPart = {
        type: 'text',
        text: 'The auth flow is implemented in @file:{github.com/simonsmh/sourcecat::auth.ts} and uses sessions @file:{github.com/simonsmh/sourcecat::auth.ts:45-60}.'
    }

    const { result } = renderHook(() => useExtractReferences(part));

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toMatchObject({
        repo: 'github.com/simonsmh/sourcecat',
        path: 'auth.ts',
        id: getFileReferenceId({ repo: 'github.com/simonsmh/sourcecat', path: 'auth.ts' }),
        type: 'file',
    });

    expect(result.current[1]).toMatchObject({
        repo: 'github.com/simonsmh/sourcecat',
        path: 'auth.ts',
        id: getFileReferenceId({
            repo: 'github.com/simonsmh/sourcecat',
            path: 'auth.ts',
            range: {
                startLine: 45,
                endLine: 60,
            }
        }),
        type: 'file',
        range: {
            startLine: 45,
            endLine: 60,
        }
    });
});
