1. Make sure [CI build](https://github.com/batect/batect-wrapper-validation-action/actions/workflows/ci.yml?query=branch%3Amain) is passing.
2. Create `release/vX.X.X` tag: `git tag -s release/vX.X.X -m vX.X.X` (eg. `git tag -s release/v1.2.3 -m v1.2.3`)
3. Push tag: `git push origin release vX.X.X` (eg. `git push origin v1.2.3`).
   CI pipeline will automatically build, test and publish tags for use by consuming workflows (eg. `v1`, `v1.2` and `v1.2.3`).
4. Create GitHub release with release notes.
