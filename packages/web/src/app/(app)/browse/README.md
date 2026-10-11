# File browser

This directory contains Sourcecat's file browser implementation. URL paths are used to determine what file the user wants to view. The following template is used:

```sh
/browse/<repo-name>[@<optional-revision-name>]/-/(blob|tree)/<path_to_file>
```

For example, to view `packages/backend/src/env.ts` in Sourcecat, we would use the following path:
```sh
/browse/github.com/simonsmh/sourcecat@HEAD/-/blob/packages/backend/src/env.ts
```
