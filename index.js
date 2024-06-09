#!/usr/bin/env node

import * as Pieces from '@pieces.app/pieces-os-client';
import os from 'os';
import hljs from 'highlight.js';
import chalk from 'chalk';
import readline from 'readline';
import ora from 'ora';
import axios from 'axios';

const platform = os.platform();
const port = platform === 'linux' ? 5323 : 1000;

const configuration = new Pieces.Configuration({
  basePath: `http://localhost:${port}`
});
const apiInstance = new Pieces.QGPTApi(configuration);

const formatResponse = (text) => {
  const lines = text.split('\n');
  let formattedText = '';
  let inCodeBlock = false;
  let codeLang = '';

  lines.forEach(line => {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      codeLang = inCodeBlock ? line.slice(3).trim() : '';
    } else if (inCodeBlock) {
      const highlighted = codeLang ? hljs.highlight(line, { language: codeLang }).value : hljs.highlightAuto(line).value;
      formattedText += applyChalk(highlighted) + '\n';
    } else if (line.startsWith('# ')) {
      formattedText += chalk.bold(line) + '\n';
    } else if (line.startsWith('* ')) {
      formattedText += chalk.green('• ') + line.slice(2) + '\n';
    } else if (line.startsWith('**') && line.endsWith('**')) {
      formattedText += chalk.bold(line.slice(2, -2)) + '\n';
    } else {
      formattedText += line + '\n';
    }
  });
  return formattedText;
};

const cleanHtml = (rawHtml) => {
  let cleanText = rawHtml.replace(/<[^>]*>/g, '');

  const htmlEntities = {
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&apos;': "'",
    '&cent;': '¢',
    '&pound;': '£',
    '&yen;': '¥',
    '&euro;': '€',
    '&copy;': '©',
    '&reg;': '®'
  };

  cleanText = cleanText.replace(/&[a-zA-Z]+;/g, (match) => htmlEntities[match] || match);
  cleanText = cleanText.replace(/\s+/g, ' ').trim();

  return cleanText;
};

const applyChalk = (highlighted) => {
  return cleanHtml(highlighted.replace(/<span class="hljs-(\w+)">(.*?)<\/span>/g, (match, p1, p2) => {
    switch (p1) {
      case 'keyword': return chalk.blue(p2);
      case 'string': return chalk.green(p2);
      case 'built_in': return chalk.cyan(p2);
      case 'comment': return chalk.gray(p2);
      case 'title': return chalk.yellow(p2);
      case 'params': return chalk.magenta(p2);
      case 'function': return chalk.red(p2);
      case 'operator': return chalk.white(p2);
      default: return p2;
    }
  }));
};

const askQuestion = async (query) => {
  if(!interactiveMode){
  const spinner = ora('Generating response...').start();
  }
  const params = {
    query,
    relevant: {
      iterable: []
    },
  };

  try {
    const result = await apiInstance.question({ qGPTQuestionInput: params });
    if(!interactiveMode){
    spinner.succeed('Response generated.');
    }
    
    return result.answers.iterable[0].text;
  } catch (error) {
    spinner.fail('Error generating response.');
    console.error('Error calling API:', error);
    throw error;
  }
};

const searchStackOverflow = async (query) => {
  if(!interactiveMode){
  const spinner = ora('Searching Stack Overflow...').start();
  }
  try {
    const response = await axios.get('https://api.stackexchange.com/2.3/search/advanced', {
      params: {
        order: 'desc',
        sort: 'relevance',
        q: query,
        site: 'stackoverflow'
      }
    });
    if(!interactiveMode){
    spinner.succeed('Stack Overflow search completed.');
    }
    return response.data.items.map(item => item.link);
  } catch (error) {
    spinner.fail('Error searching Stack Overflow.');
    console.error('Error searching Stack Overflow:', error.message);
    return [];
  }
};

const isInteractiveMode = process.argv.includes("-i") || process.argv.includes("--interactive");
const isHelp = process.argv.includes("-h") || process.argv.includes("--help");
const isVersion = process.argv.includes("-v") || process.argv.includes("--version");
const isModel = process.argv.includes("--model") || process.argv.includes("-m");

const interactiveMode = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'pieces-cli> ',
    historySize: 100,
    completer: (line) => {
      const completions = ['exit', 'help', 'version', 'clear', 'model'];
      const hits = completions.filter((c) => c.startsWith(line));
      return [hits.length ? hits : completions, line];
    }
  });

  console.log("Welcome to Pieces CLI Interactive Mode!");
  console.log("Type 'exit' to quit, 'help' for assistance, 'version' to see the version number, or 'clear' to clear the screen.");
  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    switch (input.toLowerCase()) {
      case 'exit':
        rl.close();
        break;
      case 'help':
        console.log("Available commands: exit, help, version, clear, model");
        rl.prompt();
        break;
      case 'version':
        console.log('pieces-cli version: 1.0.0'); 
        rl.prompt();
        break;
      case 'clear':
        console.clear();
        rl.prompt();
        break;
      default:
        try {
          const response = await askQuestion(input);
          console.log(formatResponse(response));

          // Check if the query is related to coding and search Stack Overflow if necessary
          if (/code|error|exception|bug|issue|problem|function|method|class|variable|syntax|compile|runtime/i.test(input)) {
            const stackOverflowLinks = await searchStackOverflow(input);
            if (stackOverflowLinks.length > 0) {
              console.log(chalk.blue("\nRelevant Stack Overflow links:"));
              stackOverflowLinks.forEach(link => console.log(chalk.blue(link)));
            } else {
              console.log(chalk.yellow("\nNo relevant Stack Overflow links found."));
            }
          }
        } catch (error) {
          console.error('Error calling API:', error);
        }
        rl.prompt();
        break;
    }
  }).on('close', () => {
    console.log('Exiting interactive mode.');
    process.exit(0);
  });
};

const displayHelp = () => {
  console.log(
`\x1b[1mWelcome to Pieces CLI | By Arindam\x1b[0m

Usage: pieces-cli [options] [query]

Options:
  -i, --interactive  Enter interactive mode
  -h, --help         Display this help message
  -v, --version      Display the version number

Examples:
  pieces-cli "What is the capital of France?"
  pieces-cli -i
  pieces-cli --help
  pieces-cli --version`
  );
};

const main = async () => {
  const args = process.argv.slice(2);

  if (isHelp) {
    displayHelp();
    process.exit(0);
  }

  if (isVersion) {
    console.log('pieces version: 1.0.0'); 
    process.exit(0);
  }

  if (isInteractiveMode) {
    await interactiveMode();
  } else {
    if (args.length === 0) {
      console.error('Please provide a query as an argument.');
      process.exit(1);
    }

    const query = args.filter(arg => 
      arg !== "-h" && 
      arg !== "--help" && 
      arg !== "-v" && 
      arg !== "--version" && 
      arg !== "-i" && 
      arg !== "--interactive" && 
      !arg.startsWith("/")
    ).join(" ");
    try {
      const response = await askQuestion(query);
      console.log(formatResponse(response));

      // Check if the query is related to coding and search Stack Overflow if necessary
      if (/code|error|exception|bug|issue|problem|function|method|class|variable|syntax|compile|runtime/i.test(query)) {
        const stackOverflowLinks = await searchStackOverflow(query);
        if (stackOverflowLinks.length > 0) {
          console.log(chalk.blue("\nRelevant Stack Overflow links:"));
          stackOverflowLinks.forEach(link => console.log(chalk.blue(link)));
        } else {
          console.log(chalk.yellow("\nNo relevant Stack Overflow links found."));
        }
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  }
};

main();