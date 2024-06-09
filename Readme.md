# Pieces CLI

Welcome to Pieces CLI, a command-line interface for interacting with the Pieces OS Client API. This tool allows you to ask questions, get formatted responses, and search Stack Overflow for relevant coding issues.

## Features

- **Interactive Mode**: Engage in an interactive session with the CLI.
- **Formatted Responses**: Get responses with syntax highlighting and formatting.
- **Stack Overflow Search**: Automatically search Stack Overflow for relevant coding issues.

## Installation

To install the Pieces CLI, you need to have Node.js and npm installed on your machine. Then, you can install the CLI globally using npm:

```sh
npm install -g pieces-cli
```

## Usage

You can use the Pieces CLI in two main ways: interactive mode or direct query mode.

### Interactive Mode

To enter interactive mode, use the `-i` or `--interactive` flag:

```sh
npx pieces-cli -i
```

In interactive mode, you can type your queries directly and get immediate responses. You can also use the following commands:

- `exit`: Quit the interactive mode.
- `help`: Display available commands.
- `version`: Display the version number.
- `clear`: Clear the screen.

### Direct Query Mode

You can also provide a query directly as an argument:

```sh
npx pieces-cli "What is the capital of France?"
```

### Options

- `-i, --interactive`: Enter interactive mode.
- `-h, --help`: Display the help message.
- `-v, --version`: Display the version number.

### Examples

```sh
# Ask a question directly
npx pieces-cli "What is the capital of France?"

# Enter interactive mode
npx pieces-cli -i

# Display help message
npx pieces-cli --help

# Display version number
npx pieces-cli --version
```

## Development

If you want to contribute or modify the CLI, follow these steps:

1. Clone the repository:

    ```sh
    git clone https://github.com/yourusername/pieces-cli.git
    ```

2. Navigate to the project directory:

    ```sh
    cd pieces-cli
    ```

3. Install dependencies:

    ```sh
    npm install
    ```

4. Run the CLI locally:

    ```sh
    node index.js
    ```

## License

This project is licensed under the MIT License.

## Contact

For any questions or issues, please open an issue on the [GitHub repository](https://github.com/yourusername/pieces-cli/issues).