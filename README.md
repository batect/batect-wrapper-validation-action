# batect-wrapper-validation-action

[![Build Status](https://github.com/batect/batect-wrapper-validation-action/workflows/CI/badge.svg)](https://github.com/batect/batect-wrapper-validation-action/actions?query=workflow%3ACI+branch%3Amain)
[![License](https://img.shields.io/github/license/batect/batect-wrapper-validation-action.svg)](https://opensource.org/licenses/Apache-2.0)
[![Chat](https://img.shields.io/badge/chat-on%20GitHub%20Discussions-brightgreen.svg)](https://github.com/batect/batect/discussions)

A GitHub Action to automatically validate the integrity of the Batect wrapper scripts (`batect` and `batect.cmd`) in your project.

## Usage

Add the following to a workflow:

```yaml
jobs:
  validate-batect-wrapper:
    name: Validate Batect wrapper scripts
    runs-on: ubuntu-20.04

    steps:
      - name: Check out code
        uses: actions/checkout@v3.5.3

      - name: Validate Batect wrapper scripts
        uses: batect/batect-wrapper-validation-action@v0.4.0
```

You can also use the action in an existing workflow or existing job.

:warning: This action _must_ run before any invocations of Batect.
If the action runs after an invocation of Batect and the wrapper script has been modified maliciously, the malicious version may be able
to modify itself to appear genuine.

## Requirements

Batect 0.79.0 or later.

## Why isn't this built into Batect?

This action exists primarily to detect malicious changes to the wrapper scripts.

If this integrity check was built in to Batect, a maliciously modified wrapper script could incorrectly report that the wrapper was genuine.

## Contributing

This project uses Yarn.

Run `yarn test` to run the unit tests.

Run `yarn pre-commit` to run the tests, check formatting and run linting.
