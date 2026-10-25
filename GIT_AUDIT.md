# GitHub repository audit

Audit date: 24 October 2026, Asia/Almaty.

Repository: [WEB-Technologies-1-Front-End-_Shyndal](https://github.com/Orinbassar-Nuradil/WEB-Technologies-1-Front-End-_Shyndal).

This is a historical record of the repository before the Assignment 4–5 upload. The findings below describe the audited commit, not the current repository.

## Verified findings at the time of the audit

- Default branch: `main`.
- The history of `main` contained 36 commits attributed to `Orinbassar-Nuradil` on GitHub.
- Latest commit: [`6b460fd`](https://github.com/Orinbassar-Nuradil/WEB-Technologies-1-Front-End-_Shyndal/commit/6b460fd7bb2947756940fcb6a1a85256f1eafe3a), `Add files via upload`, 5 October 2026, 13:33:32 Asia/Almaty.
- The published Git tag list was empty. There were no `midterm`, `assignment-4` or `assignment-5` tags.
- The audited tree contained 14 files: 10 HTML files, 2 CSS files, a README and an AI log. It had no `js`, `images` or `css` directories.
- `index.html` referenced `css/base.css` and `css/main.css`, but the repository stored these files as `base.css` and `main.css` in its root. The remote copy therefore had mismatched stylesheet paths.
- Image references existed, but the image assets were absent from that tree.
- The structure and text of `index.html` semantically matched the original Midterm ZIP. Both CSS files matched after whitespace and line-break normalization. This comparison covered only those three files; it does not verify every file or any tag.

## Implications for the assignment

The 36 older commits do not demonstrate at least six meaningful commits for Assignment 4–5. At the time of the audit, no commits implementing the new JavaScript work were present. Many existing commit messages described deleting or re-uploading files; these cannot all be counted as individual contributions to the new functionality.

Because there was no Midterm tag, the requirement to continue without changing an existing Midterm tag could not be verified. The commit representing the actual Midterm submission must be identified, and the missing tag must be addressed according to the instructor's requirements. A newly created tag must not be presented as having existed earlier.

The prepared Assignment archive uses the original supplied ZIP structure, including `css/`, `images/` and `js/` directories. It should be incorporated into the real repository while preserving its history. Any moved files or directories should be explained in the commit description. The `assignment-4` and `assignment-5` tags should identify only their actual corresponding milestones.

The audit itself was read-only: it did not modify GitHub files, branches, tags or history, and it did not create a commit, tag or pull request.

Primary evidence: `tests/repository-audit.json`. The previously disclosed limitations concerning the prohibition on AI-generated code, fictional staff data and actual browser visual testing still apply.

## Subsequent publication

The prepared Desktop/shindal snapshot was subsequently published in [`07ffd24`](https://github.com/Orinbassar-Nuradil/WEB-Technologies-1-Front-End-_Shyndal/commit/07ffd24c0c4c76d67c29cfe1025fc1bb44e2e0b0), preserving the previous history and restoring the `css/`, `images/` and `js/` directories. The earlier findings remain a record of the pre-upload state.
