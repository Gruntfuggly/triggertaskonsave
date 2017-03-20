# Trigger Task on Save

Normally you would use a watch task to make something happen when a file changes, but sometimes you just need a task to run once on save. This extension lets you do that. It's currently limited to triggering only the *build* or *test* tasks, as there doesn't seem to be a way to programmatically trigger any others at the moment (it's an upcoming feature apparently).

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.triggertaskonsave).

Alternatively, open Visual Studio code, press `Ctrl+P` or `Cmd+P` and type:

    > ext install triggertaskonsave

### Source Code

The source code is available on GitHub [here](https://github.com/Gruntfuggly/triggertaskonsave).

## Configuration

The extension can be temporarily enabled/disabled with

```json
    "triggerTaskOnSave.on": true
```

Tasks can be associated with filename globs, e.g.

```json
    "triggerTaskOnSave.tasks": {
        "build": [
            "**/*.h"
            "**/*.cpp",
        ],
        "test": [
            "**-ut/*.h"
            "**-ut/*.cpp",
        ],
    }
```

The following commands are provided, which can be access from the command pallete, or bound to keys:


    triggerTaskOnSave.enable
    triggerTaskOnSave.disable
    triggerTaskOnSave.toggle

Note: By default, the build task will be run on every file save.

### Credits

This is my first extension and is loosely based on [Format On Save](https://marketplace.visualstudio.com/items?itemName=gyuha.format-on-save).
