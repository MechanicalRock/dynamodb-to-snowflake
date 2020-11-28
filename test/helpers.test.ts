import { sanitizeBucketPrefix } from "../lib/helpers";

describe('sanitizing bucket prefixes', () => {
    it('should turn undefined string to empty string', () => {
        expect(sanitizeBucketPrefix(undefined)).toBe('');
    });

    it('should turn slashy prefix to empty prefix', () => {
        expect(sanitizeBucketPrefix('/////')).toBe('');
    });

    it('should remove leading slash from any provided prefix', () => {
        expect(sanitizeBucketPrefix('/path/to/something')).toBe('path/to/something/');
    });

    it('should ensure missing trailing slash is added', () => {
        expect(sanitizeBucketPrefix('/great/path')).toBe('great/path/');
    });

    it('should ensure no more trailing slashes added to prefix already having a trailing slash', () => {
        expect(sanitizeBucketPrefix('/great/path/')).toBe('great/path/');
    });
});