import { Plugin } from 'obsidian';
import * as templates from './templates';

export default class VaultTools extends Plugin {
  templates = templates;

  async onload() {
    window.VaultTools = this;
  }

  async onunload() {
    delete window.VaultTools;
  }
}
