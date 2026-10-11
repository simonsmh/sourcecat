import { describe, expect, test } from 'vitest';
import { deepMerge, formatMessage, getMessageByPath } from './format';

describe('getMessageByPath', () => {
    test('resolves dot paths', () => {
        expect(getMessageByPath({ a: { b: 'hi' } }, 'a.b')).toBe('hi');
    });
    test('returns undefined for missing keys', () => {
        expect(getMessageByPath({ a: {} }, 'a.b')).toBeUndefined();
        expect(getMessageByPath({ a: { b: 1 } }, 'a.b')).toBeUndefined();
    });
});

describe('formatMessage', () => {
    test('interpolates {var}', () => {
        expect(formatMessage('Hello, {name}!', { name: 'Ada' })).toBe('Hello, Ada!');
    });
    test('keeps unknown placeholders', () => {
        expect(formatMessage('Hello, {name}!')).toBe('Hello, {name}!');
    });
    test('plural one/other', () => {
        const tpl = '{count, plural, one {# repo} other {# repos}}';
        expect(formatMessage(tpl, { count: 1 })).toBe('1 repo');
        expect(formatMessage(tpl, { count: 5 })).toBe('5 repos');
    });
    test('plural exact match', () => {
        const tpl = '{count, plural, =0 {none} other {# items}}';
        expect(formatMessage(tpl, { count: 0 })).toBe('none');
        expect(formatMessage(tpl, { count: 3 })).toBe('3 items');
    });
});

describe('deepMerge', () => {
    test('overlay wins, missing keys fall back to base', () => {
        const base = { a: 'en-a', b: { c: 'en-c', d: 'en-d' } };
        const out = deepMerge(base, { b: { c: 'zh-c' } });
        expect(out).toEqual({ a: 'en-a', b: { c: 'zh-c', d: 'en-d' } });
    });
});
