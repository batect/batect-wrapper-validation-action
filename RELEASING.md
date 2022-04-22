1. Make sure [CI build](https://github.com/batect/batect-wrapper-validation-action/actions/workflows/ci.yml?query=branch%3Amain) is passing.
2. Run `./tools/release.sh <version>` (eg. `./tools/release.sh 1.2.3`). This will create and push tags for the provided version.
   The CI pipeline will automatically build, test and publish tags for use by consuming workflows (eg. `v1`, `v1.2` and `v1.2.3`).
3. Create GitHub release with release notes.
