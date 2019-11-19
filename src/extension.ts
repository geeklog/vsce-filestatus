import * as vscode from 'vscode';
import { statSync, Stats } from 'fs';

const formatDate = (date: Date) => date.toISOString().replace('T', ' ').replace('Z', '');
const formatSize = (size: number): string => {
  if (size < 1024) {
    return `${size}B`;
  }
  if (size < 1024 * 1024) {
    return `${(size/1024).toFixed(2)}K`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size/1024/1024).toFixed(2)}M`;
  }
  if (size < 1024 * 1024 * 1024 * 1024) {
    return `${(size/1024/1024/1024).toFixed(2)}G`;
  }
  return `${size}`;
};

function statusBarItem(
  subscriptions: { dispose(): any; }[],
  {text, cmdId, priority, cmdHandler}: {text: string, cmdId: string, priority: number, cmdHandler: () => any}) {
  
  subscriptions.push(vscode.commands.registerCommand(cmdId, cmdHandler));
  
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, priority);
  statusBarItem.command = cmdId;
  subscriptions.push(statusBarItem);

  statusBarItem.text = text;
  statusBarItem.show();
}

function showStatus(format: (stat: Stats) => string) {
  return () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const openedFilePath = editor.document.fileName;
      const stat = statSync(openedFilePath);
      const statText = format(stat);
      vscode.window.showInformationMessage(statText);
    } else {
      vscode.window.showInformationMessage('No file opened');
    }
  };
}

export function activate({subscriptions}: vscode.ExtensionContext) {
  statusBarItem(subscriptions, {
    text: 'Size',
    cmdId: 'mikov.showFileSize',
    priority: 100,
    cmdHandler: showStatus(stat => `Size: ${formatSize(stat.size)}`)
  });
  statusBarItem(subscriptions, {
    text: 'C',
    cmdId: 'mikov.showFileCreatedTime',
    priority: 99,
    cmdHandler: showStatus(stat => `Created at: ${formatDate(stat.ctime)}`)
  });
  statusBarItem(subscriptions, {
    text: 'A',
    cmdId: 'mikov.showFileAccessedTime',
    priority: 98,
    cmdHandler: showStatus(stat => `Accessed at: ${formatDate(stat.ctime)}`)
  });
  statusBarItem(subscriptions, {
    text: 'M',
    cmdId: 'mikov.showFileModifiedTime',
    priority: 97,
    cmdHandler: showStatus(stat => `Modified at: ${formatDate(stat.ctime)}`)
  });
}

export function deactivate() {}
