import './popup.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { PopupPanel } from '../popup/panel';
import { dateTime } from '../utils/date';
import { clickURL } from '../utils/dom';
import { getSiteAccessText } from '../utils/permissions';
import { getSettings, saveSettings, Settings } from '../utils/settings';
import meta from '../../public/manifest.meta.json';

class PopupManager {
  private panel: PopupPanel;
  private enabled: boolean = false;
  private enabledElement: HTMLInputElement | null;
  private manifestData: chrome.runtime.Manifest;
  private manifestMetadata: { [key: string]: any } = (meta as any) || {};

  constructor() {
    this.panel = new PopupPanel();
    this.enabledElement = document.getElementById('enabled') as HTMLInputElement;
    this.manifestData = chrome.runtime.getManifest();
    this.manifestMetadata = (meta as any) || {};

    this.init();
  }

  private async init(): Promise<void> {
    await this.loadInitialState();
    this.addEventListeners();
    this.initializeUI();
  }

  private async loadInitialState(): Promise<void> {
    const data = await chrome.storage.local.get('enabled');
    this.enabled = data.enabled || false;
    if (this.enabledElement) {
      this.enabledElement.checked = this.enabled;
    }
    this.showMessage(`${this.manifestData.short_name} が起動しました`);

    // 設定の読み込み
    const settings = await getSettings();

    // クイック拡張子の反映
    const extInput = document.getElementById('quick-extensions') as HTMLInputElement;
    if (extInput) extInput.value = settings.quickExtensions.join(', ');
  }

  private addEventListeners(): void {
    if (this.enabledElement) {
      this.enabledElement.addEventListener('change', async (event) => {
        this.enabled = (event.target as HTMLInputElement).checked;
        await chrome.storage.local.set({ enabled: this.enabled });
      });
    }

    // 同期変更の監視
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.enabled) {
        const enabled = changes.enabled.newValue;
        if (this.enabledElement) {
          this.enabledElement.checked = enabled;
          this.showMessage(enabled ? `${this.manifestData.short_name} は有効になっています` : `${this.manifestData.short_name} は無効になっています`);
        }
      }

      // 設定（Settings）が変更された場合，UI に反映する
      if (changes.settings) {
        const newSettings = changes.settings.newValue as Settings;
        const extInput = document.getElementById('quick-extensions') as HTMLInputElement;
        if (extInput && newSettings && Array.isArray(newSettings.quickExtensions)) {
          extInput.value = newSettings.quickExtensions.join(', ');
          this.showMessage('拡張子を更新しました');
        }
      }
    });

    this.setupSettingsListeners();
  }

  private setupSettingsListeners(): void {
    // クイック拡張子の変更監視
    const extInput = document.getElementById('quick-extensions') as HTMLInputElement;
    if (extInput) {
      extInput.addEventListener('input', async (e) => {
        const value = (e.target as HTMLInputElement).value;
        const extensions = value.split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .map(s => s.startsWith('.') ? s : `.${s}`);

        await this.updateSettings({ quickExtensions: extensions });
      });
    }
  }

  private async updateSettings(settings: Partial<Settings>): Promise<void> {
    await saveSettings(settings);
  }

  private initializeUI(): void {
    const short_name = this.manifestData.short_name || this.manifestData.name;
    const title = document.getElementById('title');
    if (title) title.textContent = short_name;

    const titleHeader = document.getElementById('title-header');
    if (titleHeader) titleHeader.textContent = short_name;

    const enabledLabel = document.getElementById('enabled-label');
    if (enabledLabel) enabledLabel.textContent = `${short_name} を有効にする`;

    const newTabButton = document.getElementById('new-tab-button');
    if (newTabButton) {
      newTabButton.addEventListener('click', () => {
        chrome.tabs.create({ url: 'popup.html' });
      });
    }

    this.setupInfoTab();
  }

  private setupInfoTab(): void {
    const storeLink = document.getElementById('store_link') as HTMLAnchorElement;
    if (storeLink) {
      storeLink.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`;
      clickURL(storeLink);
    }

    const extensionLink = document.getElementById('extension_link') as HTMLAnchorElement;
    if (extensionLink) {
      extensionLink.href = `chrome://extensions/?id=${chrome.runtime.id}`;
      clickURL(extensionLink);
    }

    const issueLink = document.getElementById('issue-link') as HTMLAnchorElement;
    if (issueLink) clickURL(issueLink);

    const extensionId = document.getElementById('extension-id');
    if (extensionId) extensionId.textContent = chrome.runtime.id;

    const extensionName = document.getElementById('extension-name');
    if (extensionName) extensionName.textContent = this.manifestData.name;

    const extensionVersion = document.getElementById('extension-version');
    if (extensionVersion) extensionVersion.textContent = this.manifestData.version;

    const extensionDescription = document.getElementById('extension-description');
    if (extensionDescription) extensionDescription.textContent = this.manifestData.description ?? '';

    chrome.permissions.getAll((result) => {
      const permissionInfo = document.getElementById('permission-info');
      if (permissionInfo && result.permissions) {
        permissionInfo.textContent = result.permissions.join(', ');
      }

      const siteAccess = getSiteAccessText(result.origins);
      const siteAccessElement = document.getElementById('site-access');
      if (siteAccessElement) siteAccessElement.innerHTML = siteAccess;
    });

    chrome.extension.isAllowedIncognitoAccess((isAllowedAccess) => {
      const incognitoEnabled = document.getElementById('incognito-enabled');
      if (incognitoEnabled) incognitoEnabled.textContent = isAllowedAccess ? '有効' : '無効';
    });

    const languageMap: { [key: string]: string } = { 'en': '英語', 'ja': '日本語' };
    const language = document.getElementById('language') as HTMLElement;
    const languages = this.manifestMetadata.languages;
    language.textContent = languages.map((lang: string) => languageMap[lang]).join(', ');

    const publisherName = document.getElementById('publisher-name') as HTMLElement;
    const publisher = this.manifestMetadata.publisher || '不明';
    publisherName.textContent = publisher;

    const developerName = document.getElementById('developer-name') as HTMLElement;
    const developer = this.manifestMetadata.developer || '不明';
    developerName.textContent = developer;

    const githubLink = document.getElementById('github-link') as HTMLAnchorElement;
    githubLink.href = this.manifestMetadata.github_url;
    githubLink.textContent = this.manifestMetadata.github_url;
    if (githubLink) clickURL(githubLink);
  }

  private showMessage(message: string, timestamp: string = dateTime()) {
    this.panel.messageOutput(message, timestamp);
  }
}

document.addEventListener('DOMContentLoaded', () => new PopupManager());