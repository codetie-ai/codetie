# Codetie.ai - Cursor-XCode-Swift-Sync

Cursor-XCode-Swift-Sync is a project boilerplate that leverages the power of [XcodeGen](https://github.com/yonaskolb/XcodeGen) to streamline the Xcode project generation process for Swift applications.

Read more at [codetie.ai](https://codetie.ai)

[![Watch the video](https://res.cloudinary.com/ddbi0suli/image/upload/v1726438129/codetie/todoapp_zmnfsk.png)](https://res.cloudinary.com/ddbi0suli/video/upload/v1725936511/codetie/twitter_cursor_swift2_jnarb7.mp4)


## Features

- Automated Xcode project generation
- Simplified project configuration using YAML or JSON
- Easy management of targets, configurations, and schemes
- Seamless integration with version control systems
- VS Code tasks for project generation, building, and linting

## Prerequisites

Before you begin, ensure you have the following installed:
- Xcode (latest stable version)
- [XcodeGen](https://github.com/yonaskolb/XcodeGen)
- [SwiftLint](https://github.com/realm/SwiftLint) (optional, for linting)

## Installation

Read docs at [codetie.ai](https://codetie.ai/docs)

## Tasks

4. Use VS Code tasks to manage your project:
   - Generate Xcode Project: `CMD+SHIFT+B` > "Tasks: Run Task" > "Generate Xcode Project with XcodeGen"
   - Build Swift Project: `CMD+SHIFT+B` > "Tasks: Run Task" > "Build Swift Project"
   - Run SwiftLint: `CMD+SHIFT+B` > "Tasks: Run Task" > "Run SwiftLint"

## Project Structure

```
Cursor-XCode-Swift-Sync/
├── Sources/
│   └── (Your Swift source files)
├── Tests/
│   └── (Your test files)
├── Resources/
│   └── (Asset catalogs, storyboards, etc.)
├── project.yml
└── README.md
```

## Built with Cursor-XCode-Swift-Sync

[Flappy Bird Clone in Swift](https://github.com/regenrek/flappy-bird-clone-swift)
[![Watch the video](https://res.cloudinary.com/ddbi0suli/image/upload/v1726438129/codetie/game_l1ze4t.png)](https://res.cloudinary.com/ddbi0suli/video/upload/v1726393407/codetie/flappy_bird_zai8ig_5_s7kmjt.mp4)


## Customization

Edit the `project.yml` file to customize your project settings, targets, and configurations. Refer to the [XcodeGen documentation](https://github.com/yonaskolb/XcodeGen/blob/master/Docs/ProjectSpec.md) for detailed information on available options.

## Benefits of Using XcodeGen

- **Version Control Friendly**: Keep your Xcode project configuration in a simple, readable format.
- **Reduced Merge Conflicts**: Eliminate `.xcodeproj` merge conflicts in team environments.
- **Consistency**: Ensure project structure consistency across team members and CI systems.
- **Automation**: Easily integrate project generation into your development and CI workflows.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Clone this repository:

```
git clone https://github.com/regenrek/Cursor-XCode-Swift-Sync
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [XcodeGen](https://github.com/yonaskolb/XcodeGen) for making Xcode project management a breeze.

---

Feel free to customize this README further to match the specific details and requirements of your Cursor2Swift project. The structure provided gives a solid foundation for explaining your project's purpose, setup process, and the benefits of using XcodeGen in your workflow.