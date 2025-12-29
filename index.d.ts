/**
 * Plurima SDK
 *
 * SDK para desenvolvimento de plugins para o Plurima.
 * Este pacote fornece apenas tipos - a implementação é injetada pelo runtime.
 *
 * @packageDocumentation
 * @module plurima
 * @version 0.2.0
 *
 * @example Plugin básico
 * ```ts
 * import { Plugin } from "plurima";
 *
 * export default class MyPlugin extends Plugin {
 *   activate() {
 *     this.api.log("Hello from plugin!");
 *   }
 * }
 * ```
 *
 * @example Plugin com React
 * ```ts
 * import { Plugin, adapters } from "plurima";
 * import React from "react";
 * import ReactDOM from "react-dom/client";
 *
 * export default class MyPlugin extends Plugin {
 *   activate() {
 *     this.views.setAdapter(adapters.react(React, ReactDOM));
 *     this.views.register({
 *       id: "main",
 *       title: "My View",
 *       component: MyComponent,
 *     });
 *   }
 * }
 * ```
 */

// ============================================
// VIEW TYPES
// ============================================

/**
 * Frameworks builtin suportados pelo Plurima.
 * @since 0.1.0
 */
export type BuiltinFramework =
  | "svelte"
  | "react"
  | "vue"
  | "web-component"
  | "vanilla";

/**
 * Tipo de framework: pode ser builtin ou um ID de plugin customizado.
 * @since 0.1.0
 */
export type FrameworkType = BuiltinFramework | (string & {});

/**
 * Definição interna de uma view (usada pelo runtime).
 * @since 0.1.0
 * @internal
 */
export interface ViewDefinition {
  /** ID único da view */
  id: string;
  /** Título exibido na UI */
  title: string;
  /** Descrição curta (tooltip) */
  brief?: string;
  /** Descrição longa */
  description?: string;
  /** Framework usado para renderizar */
  framework: FrameworkType;
  /** Componente do framework */
  component: unknown;
  /** Props passados ao componente */
  props?: Record<string, unknown>;
}

/**
 * Instância de uma view montada.
 * @since 0.1.0
 */
export interface ViewInstance {
  /** Definição original da view */
  definition: ViewDefinition;
  /** Elemento DOM onde a view está montada */
  element: HTMLElement;
  /** Se a view está atualmente montada */
  mounted: boolean;
  /** Função para desmontar e limpar a view */
  dispose: () => void;
}

/**
 * Adapter de framework para renderização de views.
 *
 * Implementa a interface entre o Plurima e um framework de UI específico.
 *
 * @since 0.1.0
 *
 * @example Implementação customizada
 * ```ts
 * const myAdapter: FrameworkAdapter = {
 *   mount(container, definition) {
 *     const element = document.createElement("div");
 *     container.appendChild(element);
 *     // Renderizar componente...
 *     return {
 *       definition,
 *       element,
 *       mounted: true,
 *       dispose: () => element.remove(),
 *     };
 *   },
 *   unmount(instance) {
 *     instance.dispose();
 *     instance.mounted = false;
 *   },
 *   update(instance, props) {
 *     // Re-renderizar com novos props...
 *   },
 * };
 * ```
 */
export interface FrameworkAdapter {
  /**
   * Monta uma view em um container.
   * @param container - Elemento DOM onde montar
   * @param definition - Definição da view
   * @returns Instância da view montada
   */
  mount(container: HTMLElement, definition: ViewDefinition): ViewInstance;

  /**
   * Desmonta uma view.
   * @param instance - Instância a desmontar
   */
  unmount(instance: ViewInstance): void;

  /**
   * Atualiza os props de uma view montada.
   * @param instance - Instância a atualizar
   * @param props - Novos props
   */
  update(instance: ViewInstance, props: Record<string, unknown>): void;
}

/**
 * Definição de view para plugins.
 *
 * @since 0.1.0
 *
 * @example
 * ```ts
 * this.views.register({
 *   id: "editor",
 *   title: "Editor",
 *   brief: "Edit files",
 *   component: EditorComponent,
 *   props: { theme: "dark" },
 *   css: `.editor { padding: 16px; }`,
 * });
 * ```
 */
export interface PluginViewDefinition {
  /**
   * ID único da view (será prefixado com o ID do plugin).
   * @example "editor", "settings", "preview"
   */
  id: string;

  /**
   * Título exibido na tab/header da view.
   * @example "Editor", "Settings", "Preview"
   */
  title: string;

  /**
   * Descrição curta exibida em tooltips.
   * @example "Edit source files"
   */
  brief?: string;

  /**
   * Descrição longa.
   */
  description?: string;

  /**
   * Componente do framework configurado via `setAdapter()`.
   * O tipo depende do framework usado.
   */
  component: unknown;

  /**
   * Props iniciais passados ao componente.
   */
  props?: Record<string, unknown>;

  /**
   * CSS customizado para esta view.
   *
   * O CSS é injetado quando a view é registrada e removido quando desregistrada.
   * Use variáveis CSS do tema para consistência visual.
   *
   * @since 0.1.0
   *
   * @example
   * ```ts
   * css: `
   *   .my-view {
   *     padding: var(--space-4);
   *     background: var(--surface);
   *   }
   *   .my-view-header {
   *     border-bottom: 1px solid var(--border);
   *   }
   * `,
   * ```
   */
  css?: string;
}

/**
 * API de views para plugins.
 * @since 0.1.0
 */
export interface PluginViewsAPI {
  /**
   * Define o adapter de framework para este plugin.
   *
   * Deve ser chamado **antes** de registrar views.
   * Use os adapters prontos de `adapters` ou crie um customizado.
   *
   * @since 0.1.0
   *
   * @param adapter - Adapter do framework
   *
   * @example
   * ```ts
   * import { adapters } from "plurima";
   * import React from "react";
   * import ReactDOM from "react-dom/client";
   *
   * this.views.setAdapter(adapters.react(React, ReactDOM));
   * ```
   */
  setAdapter(adapter: FrameworkAdapter): void;

  /**
   * Registra uma view.
   *
   * @since 0.1.0
   *
   * @param definition - Definição da view
   *
   * @example
   * ```ts
   * this.views.register({
   *   id: "main",
   *   title: "My View",
   *   component: MyComponent,
   * });
   * ```
   */
  register(definition: PluginViewDefinition): void;

  /**
   * Abre uma view pelo ID.
   *
   * @since 0.1.0
   *
   * @param viewId - ID da view (sem prefixo do plugin)
   *
   * @example
   * ```ts
   * this.views.open("main");
   * ```
   */
  open(viewId: string): void;
}

// ============================================
// COMMAND TYPES
// ============================================

/**
 * Definição de comando (usada pelo runtime).
 * @since 0.1.0
 * @internal
 */
export interface CommandDefinition {
  /** ID único do comando */
  id: string;
  /** Título exibido na UI */
  title?: string;
  /** Descrição do comando */
  description?: string;
  /** Categoria para agrupamento */
  category?: string;
  /** Handler executado quando o comando é chamado */
  handler: (...args: unknown[]) => unknown | Promise<unknown>;
}

/**
 * Definição de comando para plugins.
 *
 * @since 0.1.0
 *
 * @example
 * ```ts
 * this.commands.register({
 *   id: "openFile",
 *   title: "Open File",
 *   description: "Open a file in the editor",
 *   category: "File",
 *   handler: async (path: string) => {
 *     await this.editor.open(path);
 *   },
 * });
 * ```
 */
export interface PluginCommandDefinition {
  /**
   * ID único do comando (será prefixado com o ID do plugin).
   * @example "open", "save", "export"
   */
  id: string;

  /**
   * Título exibido na command palette e menus.
   * @example "Open File", "Save Document"
   */
  title?: string;

  /**
   * Descrição do que o comando faz.
   */
  description?: string;

  /**
   * Categoria para agrupamento na UI.
   * @example "File", "Edit", "View"
   */
  category?: string;

  /**
   * Handler executado quando o comando é chamado.
   * Pode ser async e receber argumentos.
   */
  handler: (...args: unknown[]) => unknown | Promise<unknown>;
}

/**
 * API de comandos para plugins.
 * @since 0.1.0
 */
export interface PluginCommandsAPI {
  /**
   * Registra um comando.
   *
   * O ID será prefixado com o ID do plugin automaticamente.
   *
   * @since 0.1.0
   *
   * @param definition - Definição do comando
   *
   * @example
   * ```ts
   * this.commands.register({
   *   id: "open",
   *   title: "Open My Plugin",
   *   handler: () => this.views.open("main"),
   * });
   * ```
   */
  register(definition: PluginCommandDefinition): void;

  /**
   * Executa um comando pelo ID.
   *
   * Se o ID não contiver ".", será prefixado com o ID do plugin.
   *
   * @since 0.1.0
   *
   * @typeParam T - Tipo do retorno esperado
   * @param commandId - ID do comando
   * @param args - Argumentos para o handler
   * @returns Promise com o resultado
   *
   * @example
   * ```ts
   * // Comando do próprio plugin
   * await this.commands.execute("open");
   *
   * // Comando de outro plugin
   * await this.commands.execute("other-plugin.command", arg1, arg2);
   * ```
   */
  execute<T = unknown>(commandId: string, ...args: unknown[]): Promise<T>;

  /**
   * Obtém a definição de um comando pelo ID.
   *
   * @since 0.1.0
   *
   * @param commandId - ID do comando
   * @returns Definição ou `undefined`
   */
  get(commandId: string): CommandDefinition | undefined;
}

// ============================================
// THEME TYPES
// ============================================

/**
 * Definição de tema.
 *
 * @since 0.1.0
 *
 * @example
 * ```ts
 * this.api.addTheme({
 *   id: "my-theme",
 *   name: "My Theme",
 *   author: "John Doe",
 *   uri: "themes/my-theme.css",
 *   variants: ["light", "dark"],
 * });
 * ```
 */
export interface ThemeDefinition {
  /** ID único do tema */
  id: string;
  /** Nome exibido na UI */
  name: string;
  /** Autor do tema */
  author?: string;
  /** URI do arquivo CSS (relativo ao plugin) */
  uri: string;
  /** Variantes disponíveis */
  variants: string[];
}

// ============================================
// SETTINGS TYPES
// ============================================

/**
 * Tipos de configuração suportados.
 * @since 0.1.0
 */
export type SettingType =
  /** Checkbox on/off */
  | "boolean"
  /** Campo de texto */
  | "string"
  /** Campo numérico */
  | "number"
  /** Dropdown com opções */
  | "select"
  /** Radio buttons */
  | "radio"
  /** Seletor de arquivo */
  | "filepath"
  /** Seletor de cor */
  | "color";

/**
 * Opção para settings do tipo select/radio.
 * @since 0.1.0
 */
export interface SettingOption {
  /** Texto exibido */
  label: string;
  /** Valor quando selecionado */
  value: string | number;
}

/**
 * Definição de uma configuração individual.
 *
 * @since 0.1.0
 *
 * @example Boolean
 * ```ts
 * {
 *   id: "enabled",
 *   label: "Enable feature",
 *   type: "boolean",
 *   default: true,
 * }
 * ```
 *
 * @example Select
 * ```ts
 * {
 *   id: "format",
 *   label: "Date format",
 *   type: "select",
 *   default: "iso",
 *   options: [
 *     { label: "ISO 8601", value: "iso" },
 *     { label: "US", value: "us" },
 *     { label: "EU", value: "eu" },
 *   ],
 * }
 * ```
 *
 * @example Number com range
 * ```ts
 * {
 *   id: "fontSize",
 *   label: "Font size",
 *   type: "number",
 *   default: 14,
 *   min: 8,
 *   max: 32,
 *   step: 1,
 * }
 * ```
 */
export interface SettingDefinition {
  /** ID único da setting */
  id: string;
  /** Label exibido na UI */
  label: string;
  /** Descrição/help text */
  description?: string;
  /** Tipo da configuração */
  type: SettingType;
  /** Valor padrão */
  default: unknown;
  /** Opções para select/radio */
  options?: SettingOption[];
  /** Valor mínimo (number) */
  min?: number;
  /** Valor máximo (number) */
  max?: number;
  /** Incremento (number) */
  step?: number;
  /** Placeholder (string) */
  placeholder?: string;
  /** Exibir inline com o label */
  inline?: boolean;
}

/**
 * Subseção de configurações.
 * @since 0.1.0
 */
export interface SettingSubsection {
  /** ID único da subseção */
  id: string;
  /** Título da subseção */
  label: string;
  /** Settings nesta subseção */
  settings: SettingDefinition[];
}

/**
 * Seção de configurações (usada pelo runtime).
 * @since 0.1.0
 * @internal
 */
export interface SettingSection {
  /** ID único da seção */
  id: string;
  /** Título da seção */
  label: string;
  /** Subseções */
  subsections: SettingSubsection[];
}

/**
 * Seção de configurações para plugins.
 *
 * @since 0.1.0
 *
 * @example
 * ```ts
 * this.settings.register({
 *   id: "myPlugin",
 *   label: "My Plugin",
 *   subsections: [{
 *     id: "general",
 *     label: "General",
 *     settings: [
 *       { id: "enabled", label: "Enabled", type: "boolean", default: true },
 *     ],
 *   }],
 * });
 * ```
 */
export interface PluginSettingSection {
  /** ID único da seção (geralmente o ID do plugin) */
  id: string;
  /** Título exibido na UI */
  label: string;
  /** Subseções com settings */
  subsections: PluginSettingSubsection[];
}

/**
 * Subseção de configurações para plugins.
 * @since 0.1.0
 */
export interface PluginSettingSubsection {
  /** ID único da subseção */
  id: string;
  /** Título da subseção */
  label: string;
  /** Settings nesta subseção */
  settings: SettingDefinition[];
}

/**
 * API de settings para plugins.
 * @since 0.1.0
 */
export interface PluginSettingsAPI {
  /**
   * Registra uma seção de configurações.
   *
   * @since 0.1.0
   *
   * @param section - Definição da seção
   *
   * @example
   * ```ts
   * this.settings.register({
   *   id: "clock",
   *   label: "Clock",
   *   subsections: [{
   *     id: "format",
   *     label: "Format",
   *     settings: [{
   *       id: "use24Hour",
   *       label: "Use 24-hour format",
   *       type: "boolean",
   *       default: true,
   *     }],
   *   }],
   * });
   * ```
   */
  register(section: PluginSettingSection): void;

  /**
   * Obtém o valor de uma configuração.
   *
   * @since 0.1.0
   *
   * @typeParam T - Tipo do valor
   * @param key - Chave no formato "section.subsection.setting"
   * @returns Valor ou `undefined`
   *
   * @example
   * ```ts
   * const use24Hour = this.settings.get<boolean>("clock.format.use24Hour");
   * ```
   */
  get<T>(key: string): T | undefined;

  /**
   * Define o valor de uma configuração.
   *
   * @since 0.1.0
   *
   * @typeParam T - Tipo do valor
   * @param key - Chave da configuração
   * @param value - Novo valor
   *
   * @example
   * ```ts
   * this.settings.set("clock.format.use24Hour", false);
   * ```
   */
  set<T>(key: string, value: T): void;

  /**
   * Observa mudanças em uma configuração.
   *
   * @since 0.1.0
   *
   * @typeParam T - Tipo do valor
   * @param key - Chave da configuração
   * @param callback - Função chamada quando mudar
   * @returns Função para cancelar observação
   *
   * @example
   * ```ts
   * const unsubscribe = this.settings.onChange("clock.format.use24Hour", (value) => {
   *   this.updateDisplay(value);
   * });
   * ```
   */
  onChange<T>(key: string, callback: (value: T) => void): () => void;
}

// ============================================
// KEYBINDING TYPES
// ============================================

/**
 * Definição de atalho de teclado.
 *
 * @since 0.1.0
 *
 * @example
 * ```ts
 * this.api.addKeybinding({
 *   keys: "ctrl+shift+p",
 *   command: "palette.open",
 * });
 *
 * // Múltiplas teclas
 * this.api.addKeybinding({
 *   keys: ["ctrl+s", "cmd+s"],
 *   command: "file.save",
 * });
 * ```
 */
export interface KeybindingDefinition {
  /**
   * Tecla(s) do atalho.
   * Use `ctrl`, `alt`, `shift`, `cmd` (macOS) como modificadores.
   * @example "ctrl+s", ["ctrl+s", "cmd+s"]
   */
  keys: string | string[];

  /**
   * ID do comando a executar.
   */
  command: string;

  /**
   * Argumentos passados ao comando.
   */
  args?: unknown[];
}

// ============================================
// CONTEXT MENU TYPES
// ============================================

/**
 * Item do context menu.
 *
 * @since 0.1.0
 *
 * @example
 * ```ts
 * {
 *   id: "edit",
 *   label: "Edit",
 *   icon: "Pencil",
 *   shortcut: "Ctrl+E",
 * }
 * ```
 */
export interface ContextMenuItem {
  /** ID retornado quando clicado */
  id: string;
  /** Texto exibido */
  label: string;
  /** Nome do ícone (Lucide) */
  icon?: string;
  /** Atalho exibido (apenas visual) */
  shortcut?: string;
  /** Estilo do item */
  variant?: "default" | "danger";
  /** Se está desabilitado */
  disabled?: boolean;
}

/**
 * Separador entre itens do context menu.
 * @since 0.1.0
 */
export interface ContextMenuSeparator {
  type: "separator";
}

/**
 * Item ou separador do context menu.
 * @since 0.1.0
 */
export type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator;

// ============================================
// PALETTE TYPES
// ============================================

/**
 * Item exibido na command palette.
 *
 * @since 0.1.0
 */
export interface PaletteItem {
  /** ID único do item */
  id: string;
  /** Título principal */
  title: string;
  /** Descrição secundária */
  description?: string;
  /** Categoria para agrupamento */
  category: string;
  /** Ícone (componente ou string) */
  icon?: unknown;
  /** Atalho exibido */
  keybinding?: string;
  /** Dados extras passados ao onExecute */
  data?: Record<string, unknown>;
}

/**
 * Contexto passado para palette providers.
 * @since 0.1.0
 */
export interface PaletteProviderContext {
  /** Fecha a palette, opcionalmente com resultado */
  close(result?: unknown): void;
  /** Altera a query de busca */
  setQuery(query: string): void;
  /** Copia texto para clipboard */
  copyToClipboard(text: string): Promise<void>;
}

/**
 * Provider de items para a command palette.
 *
 * @since 0.1.0
 *
 * @example
 * ```ts
 * this.api.addPaletteProvider({
 *   id: "files",
 *   prefix: ">",
 *   name: "Files",
 *   placeholder: "Search files...",
 *   getItems(query) {
 *     return files.filter(f => f.name.includes(query));
 *   },
 *   onExecute(item) {
 *     openFile(item.data.path);
 *   },
 * });
 * ```
 */
export interface PaletteProvider {
  /** ID único do provider */
  id: string;
  /** Prefixo que ativa o provider (null = sempre ativo) */
  prefix: string | null;
  /** Nome exibido */
  name: string;
  /** Ícone */
  icon?: unknown;
  /** Placeholder do input */
  placeholder?: string;
  /** Prioridade de ordenação */
  priority?: number;

  /**
   * Retorna items baseados na query.
   * @param query - Texto digitado pelo usuário
   */
  getItems(query: string): PaletteItem[] | Promise<PaletteItem[]>;

  /**
   * Executado quando um item é selecionado.
   * @param item - Item selecionado
   * @param query - Query atual
   */
  onExecute(item: PaletteItem, query: string): unknown | Promise<unknown>;

  /** Chamado quando o provider é ativado */
  onActivate?(): void;

  /** Chamado quando o provider é desativado */
  onDeactivate?(): void;
}

// ============================================
// DATABASE API
// ============================================

/**
 * API para acesso ao banco de dados SQLite do workspace.
 *
 * Permite executar queries SQL no banco de dados do workspace atual.
 * Use com cuidado - queries incorretas podem corromper dados.
 *
 * @since 0.2.0
 *
 * @example Query simples
 * ```ts
 * const notes = await this.database.query<{ id: string; path: string }>(
 *   "SELECT id, path FROM vfiles WHERE extension = ?",
 *   [".md"]
 * );
 * ```
 *
 * @example Insert/Update
 * ```ts
 * const result = await this.database.run(
 *   "INSERT INTO my_table (name, value) VALUES (?, ?)",
 *   ["key", "value"]
 * );
 * console.log(`Inserted with ID: ${result.lastInsertRowid}`);
 * ```
 */
export interface PluginDatabaseAPI {
  /**
   * Executa uma query SELECT e retorna todas as linhas.
   * @since 0.2.0
   * @typeParam T - Tipo das linhas retornadas
   * @param sql - Query SQL
   * @param params - Parâmetros para placeholders (?)
   * @returns Array de resultados
   * @throws Error se a query falhar
   *
   * @example
   * ```ts
   * const files = await this.database.query<{ id: string; name: string }>(
   *   "SELECT id, name FROM vfiles WHERE mimeType = ?",
   *   ["application/json"]
   * );
   * ```
   */
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Executa uma query SELECT e retorna apenas a primeira linha.
   * @since 0.2.0
   * @typeParam T - Tipo da linha retornada
   * @param sql - Query SQL
   * @param params - Parâmetros para placeholders (?)
   * @returns Primeira linha ou null se não houver resultados
   * @throws Error se a query falhar
   *
   * @example
   * ```ts
   * const file = await this.database.get<{ id: string; name: string }>(
   *   "SELECT id, name FROM vfiles WHERE path = ?",
   *   ["/notes/example.md"]
   * );
   * ```
   */
  get<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;

  /**
   * Executa uma query INSERT, UPDATE ou DELETE.
   * @since 0.2.0
   * @param sql - Query SQL
   * @param params - Parâmetros para placeholders (?)
   * @returns Objeto com número de linhas afetadas e último ID inserido
   * @throws Error se a query falhar
   *
   * @example
   * ```ts
   * const result = await this.database.run(
   *   "UPDATE my_table SET value = ? WHERE key = ?",
   *   ["new-value", "my-key"]
   * );
   * console.log(`Updated ${result.changes} rows`);
   * ```
   */
  run(sql: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowid?: number }>;
}

// ============================================
// PLUGIN API
// ============================================

/**
 * API completa disponível para plugins.
 *
 * Esta interface é injetada automaticamente pelo runtime do Plurima
 * no constructor de cada plugin. Acesse via `this.api` dentro do plugin.
 *
 * @since 0.1.0
 */
export interface PluginAPI {
  /**
   * ID único do plugin.
   * @since 0.1.0
   */
  readonly pluginId: string;

  /**
   * Caminho absoluto da pasta do plugin.
   * @since 0.1.0
   */
  readonly pluginPath: string;

  /**
   * API para gerenciar comandos do plugin.
   * @since 0.1.0
   */
  readonly commands: PluginCommandsAPI;

  /**
   * API para gerenciar views do plugin.
   * @since 0.1.0
   */
  readonly views: PluginViewsAPI;

  /**
   * API para gerenciar configurações do plugin.
   * @since 0.1.0
   */
  readonly settings: PluginSettingsAPI;

  /**
   * API para acesso ao banco de dados SQLite do workspace.
   * @since 0.2.0
   */
  readonly database: PluginDatabaseAPI;

  /**
   * Adiciona um tema ao Plurima.
   * @since 0.1.0
   */
  addTheme(definition: ThemeDefinition): void;

  /**
   * Pré-carrega CSS de um tema.
   * @since 0.1.0
   */
  preloadThemeCSS(uri: string, css: string): void;

  /**
   * Adiciona um atalho de teclado.
   * @since 0.1.0
   */
  addKeybinding(definition: KeybindingDefinition): void;

  /**
   * Adiciona um provider para a command palette.
   * @since 0.1.0
   */
  addPaletteProvider(provider: PaletteProvider): void;

  /**
   * Exibe um diálogo de confirmação.
   * @since 0.1.0
   */
  confirm(message: string): Promise<boolean>;

  /**
   * Exibe um diálogo de alerta.
   * @since 0.1.0
   */
  alert(message: string): Promise<void>;

  /**
   * Exibe um diálogo de prompt.
   * @since 0.1.0
   */
  prompt(message: string, defaultValue?: string): Promise<string | null>;

  /**
   * Exibe um context menu.
   * @since 0.1.0
   */
  showContextMenu(x: number, y: number, items: ContextMenuEntry[]): Promise<string | null>;

  /**
   * Log com prefixo do plugin.
   * @since 0.1.0
   */
  log(...args: unknown[]): void;

  /**
   * Warning com prefixo do plugin.
   * @since 0.1.0
   */
  warn(...args: unknown[]): void;

  /**
   * Error com prefixo do plugin.
   * @since 0.1.0
   */
  error(...args: unknown[]): void;
}

// ============================================
// ADAPTERS
// ============================================

/**
 * Tipo mínimo para React (não requer @types/react).
 * @since 0.1.0
 */
export interface ReactLike {
  createElement: unknown;
}

/**
 * Tipo mínimo para ReactDOM (não requer @types/react-dom).
 * @since 0.1.0
 */
export interface ReactDOMLike {
  createRoot: unknown;
}

/**
 * Adapters de framework disponíveis para plugins.
 *
 * O runtime do Plurima injeta a implementação via `window.plurima.adapters`.
 *
 * @since 0.1.0
 *
 * @example React
 * ```ts
 * import { Plugin, adapters } from "plurima";
 * import React from "react";
 * import ReactDOM from "react-dom/client";
 *
 * this.views.setAdapter(adapters.react(React, ReactDOM));
 * ```
 *
 * @example Svelte
 * ```ts
 * import { Plugin, adapters } from "plurima";
 *
 * this.views.setAdapter(adapters.svelte);
 * ```
 */
export declare const adapters: {
  /**
   * Adapter para React 18+.
   * @since 0.1.0
   */
  react: (React: ReactLike, ReactDOM: ReactDOMLike) => FrameworkAdapter;

  /**
   * Adapter para Svelte 4+.
   * @since 0.1.0
   */
  svelte: FrameworkAdapter;

  /**
   * Adapter para Vanilla JavaScript.
   * @since 0.1.0
   */
  vanilla: FrameworkAdapter;

  /**
   * Adapter para Web Components.
   * @since 0.2.0
   */
  webComponent: FrameworkAdapter;
};

// ============================================
// PUBLIC APIs
// ============================================

/**
 * API pública de settings.
 *
 * Permite ler, escrever e observar settings de qualquer lugar.
 * Para **registrar** novas settings, use `this.settings.register()` dentro de um Plugin.
 *
 * @since 0.1.0
 *
 * @example
 * ```ts
 * import { settings } from "plurima";
 *
 * const theme = settings.get<string>("appearance.theme");
 * settings.set("appearance.theme", "dark");
 *
 * const unsubscribe = settings.onChange("appearance.theme", (value) => {
 *   console.log("Theme changed:", value);
 * });
 * ```
 */
export declare const settings: {
  /**
   * Obtém o valor de uma configuração.
   * @since 0.1.0
   */
  get<T>(key: string): T | undefined;

  /**
   * Define o valor de uma configuração.
   * @since 0.1.0
   */
  set<T>(key: string, value: T): void;

  /**
   * Observa mudanças em uma configuração.
   * @since 0.1.0
   */
  onChange<T>(key: string, callback: (value: T) => void): () => void;
};

/**
 * API pública de commands.
 *
 * Permite executar e consultar comandos de qualquer lugar.
 * Para **registrar** novos comandos, use `this.commands.register()` dentro de um Plugin.
 *
 * @since 0.1.0
 *
 * @example
 * ```ts
 * import { commands } from "plurima";
 *
 * await commands.execute("clock.open");
 * const cmd = commands.get("clock.open");
 * ```
 */
export declare const commands: {
  /**
   * Executa um comando pelo ID.
   * @since 0.1.0
   */
  execute<T = unknown>(commandId: string, ...args: unknown[]): Promise<T>;

  /**
   * Obtém a definição de um comando pelo ID.
   * @since 0.1.0
   */
  get(commandId: string): CommandDefinition | undefined;
};

// ============================================
// PLUGIN CLASS
// ============================================

/**
 * Classe base para plugins Plurima.
 *
 * Plugins devem estender esta classe e implementar o método `activate()`.
 * O runtime do Plurima injeta a API automaticamente no constructor.
 *
 * @since 0.1.0
 *
 * @example Plugin básico
 * ```ts
 * import { Plugin } from "plurima";
 *
 * export default class HelloPlugin extends Plugin {
 *   activate() {
 *     this.api.log("Hello from plugin!");
 *   }
 * }
 * ```
 *
 * @example Plugin com React
 * ```ts
 * import { Plugin, adapters } from "plurima";
 * import React from "react";
 * import ReactDOM from "react-dom/client";
 * import { MyView } from "./MyView";
 *
 * export default class MyPlugin extends Plugin {
 *   activate() {
 *     this.views.setAdapter(adapters.react(React, ReactDOM));
 *     this.views.register({
 *       id: "main",
 *       title: "My View",
 *       component: MyView,
 *     });
 *     this.commands.register({
 *       id: "open",
 *       title: "Open My Plugin",
 *       handler: () => this.views.open("main"),
 *     });
 *   }
 * }
 * ```
 */
export declare abstract class Plugin {
  /**
   * API do plugin injetada pelo runtime.
   * @since 0.1.0
   */
  protected readonly api: PluginAPI;

  /**
   * API para gerenciar views do plugin.
   * @since 0.1.0
   */
  protected get views(): PluginViewsAPI;

  /**
   * API para gerenciar comandos do plugin.
   * @since 0.1.0
   */
  protected get commands(): PluginCommandsAPI;

  /**
   * API para gerenciar settings do plugin.
   * @since 0.1.0
   */
  protected get settings(): PluginSettingsAPI;

  /**
   * API para acesso ao banco de dados SQLite do workspace.
   * @since 0.2.0
   */
  protected get database(): PluginDatabaseAPI;

  /**
   * Chamado quando o plugin é ativado.
   * @since 0.1.0
   */
  abstract activate(): void | Promise<void>;

  /**
   * Chamado quando o plugin é desativado.
   * Opcional - o runtime faz cleanup automático.
   * @since 0.1.0
   */
  deactivate?(): void | Promise<void>;
}

// ============================================
// GLOBAL TYPE AUGMENTATION
// ============================================

/**
 * Runtime do Plurima exposto em window.plurima.
 * @internal
 */
export interface PlurimaRuntime {
  adapters: {
    react: (React: unknown, ReactDOM: unknown) => FrameworkAdapter;
    svelte: FrameworkAdapter;
    vanilla: FrameworkAdapter;
    webComponent: FrameworkAdapter;
  };
  settings: {
    get<T>(key: string): T | undefined;
    set(key: string, value: unknown): void;
    onChange(key: string, callback: (value: unknown) => void): () => void;
  };
  commands: {
    execute<T = unknown>(commandId: string, ...args: unknown[]): Promise<T>;
    get(commandId: string): CommandDefinition | undefined;
  };
}

declare global {
  interface Window {
    /**
     * Runtime do Plurima.
     * Disponível apenas quando executando dentro do Plurima.
     */
    plurima?: PlurimaRuntime;
  }
}
