import type { Schema, Struct } from '@strapi/strapi';

export interface ActionBottomQuickAction extends Struct.ComponentSchema {
  collectionName: 'components_action_bottom_quick_actions';
  info: {
    displayName: 'bottomQuickAction';
  };
  attributes: {
    bottomInset: Schema.Attribute.Integer;
    collapsedIcon: Schema.Attribute.String;
    collapsedLabel: Schema.Attribute.String;
    collapsedVariant: Schema.Attribute.Enumeration<
      ['fab', 'button-with-text', 'transparency']
    >;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    expanded: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    horizontalScroll: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    secondRow: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    skeleton: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    title: Schema.Attribute.String;
  };
}

export interface ActionButton extends Struct.ComponentSchema {
  collectionName: 'components_action_buttons';
  info: {
    displayName: 'button';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    iconName: Schema.Attribute.String;
    label: Schema.Attribute.String;
    loading: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    size: Schema.Attribute.Enumeration<['sm', 'md', 'lg']>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    type: Schema.Attribute.Enumeration<['filled', 'outlined', 'ghost']>;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'destructive']
    >;
  };
}

export interface ActionChip extends Struct.ComponentSchema {
  collectionName: 'components_action_chips';
  info: {
    displayName: 'chip';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
    selected: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    type: Schema.Attribute.Enumeration<['filter', 'input', 'suggestion']>;
  };
}

export interface AssetIcon extends Struct.ComponentSchema {
  collectionName: 'components_asset_icons';
  info: {
    displayName: 'icon';
  };
  attributes: {
    color: Schema.Attribute.String;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    iconName: Schema.Attribute.String;
    size: Schema.Attribute.Integer;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
  };
}

export interface AssetImage extends Struct.ComponentSchema {
  collectionName: 'components_asset_images';
  info: {
    displayName: 'image';
  };
  attributes: {
    alt: Schema.Attribute.String;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    imageUrl: Schema.Attribute.String;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
  };
}

export interface ContainerAccordion extends Struct.ComponentSchema {
  collectionName: 'components_container_accordions';
  info: {
    displayName: 'accordion';
  };
  attributes: {
    allowMultiple: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    gap: Schema.Attribute.Integer;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    variant: Schema.Attribute.Enumeration<['list', 'card']>;
  };
}

export interface ContainerBanner extends Struct.ComponentSchema {
  collectionName: 'components_container_banners';
  info: {
    displayName: 'banner';
  };
  attributes: {
    carousel: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    loading: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    mode: Schema.Attribute.Enumeration<['picture', 'text']>;
    size: Schema.Attribute.Enumeration<['S', 'M']>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
  };
}

export interface ContainerBento extends Struct.ComponentSchema {
  collectionName: 'components_container_bentos';
  info: {
    displayName: 'bento';
  };
  attributes: {
    columns: Schema.Attribute.Integer;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    gap: Schema.Attribute.Integer;
    rowHeight: Schema.Attribute.Integer;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
  };
}

export interface ContainerCard extends Struct.ComponentSchema {
  collectionName: 'components_container_cards';
  info: {
    displayName: 'card';
    icon: 'cast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    variant: Schema.Attribute.Enumeration<
      ['horizontal', 'withDetails', 'text', 'stepper']
    >;
  };
}

export interface ContainerDivider extends Struct.ComponentSchema {
  collectionName: 'components_container_dividers';
  info: {
    displayName: 'divider';
    icon: 'cast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    inset: Schema.Attribute.Integer;
    label: Schema.Attribute.String;
    orientation: Schema.Attribute.Enumeration<['horizontal', 'vertical']> &
      Schema.Attribute.DefaultTo<'horizontal'>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    thickness: Schema.Attribute.Integer;
  };
}

export interface ContainerList extends Struct.ComponentSchema {
  collectionName: 'components_container_lists';
  info: {
    displayName: 'list';
    icon: 'cast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    emptyText: Schema.Attribute.String;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    title: Schema.Attribute.String;
  };
}

export interface CoreAvatar extends Struct.ComponentSchema {
  collectionName: 'components_core_avatars';
  info: {
    displayName: 'avatar';
    icon: 'cast';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    bordered: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    fallbackText: Schema.Attribute.String;
    imageUri: Schema.Attribute.String;
    size: Schema.Attribute.String;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    textColor: Schema.Attribute.String;
  };
}

export interface CoreGrid extends Struct.ComponentSchema {
  collectionName: 'components_core_grids';
  info: {
    displayName: 'grid';
    icon: 'cast';
  };
  attributes: {
    autoFit: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    numOfColumns: Schema.Attribute.Integer;
    rowGap: Schema.Attribute.Integer;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
  };
}

export interface CoreTypo extends Struct.ComponentSchema {
  collectionName: 'components_core_typos';
  info: {
    displayName: 'typo';
    icon: 'cast';
  };
  attributes: {
    color: Schema.Attribute.String;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    textAlign: Schema.Attribute.Enumeration<
      ['left', 'center', 'right', 'justify']
    >;
    type: Schema.Attribute.String;
    value: Schema.Attribute.String;
    weight: Schema.Attribute.String;
  };
}

export interface FormDependsOnItem extends Struct.ComponentSchema {
  collectionName: 'components_form_depends_on_items';
  info: {
    displayName: 'dependsOnItem';
    icon: 'link';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface FormDynamic extends Struct.ComponentSchema {
  collectionName: 'components_form_dynamics';
  info: {
    displayName: 'dynamic';
    icon: 'refresh';
  };
  attributes: {
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    source: Schema.Attribute.Component<'form.dynamic-source', false>;
    target: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<['CONTENT', 'OPTIONS', 'VALUE']>;
  };
}

export interface FormDynamicSource extends Struct.ComponentSchema {
  collectionName: 'components_form_dynamic_sources';
  info: {
    displayName: 'dynamic-source';
    icon: 'plug';
  };
  attributes: {
    path: Schema.Attribute.String;
    serviceCode: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<['FACT', 'SERVICE']>;
  };
}

export interface FormMessages extends Struct.ComponentSchema {
  collectionName: 'components_form_messages';
  info: {
    displayName: 'messages';
    icon: 'message';
  };
  attributes: {
    email: Schema.Attribute.String;
    maxLength: Schema.Attribute.String;
    minLength: Schema.Attribute.String;
    pattern: Schema.Attribute.String;
    required: Schema.Attribute.String;
    type: Schema.Attribute.String;
  };
}

export interface FormOption extends Struct.ComponentSchema {
  collectionName: 'components_form_options';
  info: {
    displayName: 'option';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface FormRule extends Struct.ComponentSchema {
  collectionName: 'components_form_rules';
  info: {
    displayName: 'rule';
    icon: 'filter';
  };
  attributes: {
    condition: Schema.Attribute.Component<'form.rule-condition', false>;
    effect: Schema.Attribute.Enumeration<
      ['HIDE', 'SHOW', 'ENABLE', 'DISABLE']
    > &
      Schema.Attribute.Required;
  };
}

export interface FormRuleCondition extends Struct.ComponentSchema {
  collectionName: 'components_form_rule_conditions';
  info: {
    displayName: 'ruleCondition';
    icon: 'filter';
  };
  attributes: {
    schema: Schema.Attribute.JSON;
    scope: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface InputCheckbox extends Struct.ComponentSchema {
  collectionName: 'components_input_checkboxes';
  info: {
    displayName: 'checkbox';
    icon: 'cast';
  };
  attributes: {
    choices: Schema.Attribute.Component<'form.option', true>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dependsOn: Schema.Attribute.Component<'form.depends-on-item', true>;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    label: Schema.Attribute.String;
    maxLength: Schema.Attribute.Integer;
    messages: Schema.Attribute.Component<'form.messages', false>;
    minLength: Schema.Attribute.Integer;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    rule: Schema.Attribute.Component<'form.rule', false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    type: Schema.Attribute.String;
  };
}

export interface InputDropdown extends Struct.ComponentSchema {
  collectionName: 'components_input_dropdowns';
  info: {
    displayName: 'dropdown';
    icon: 'cast';
  };
  attributes: {
    choices: Schema.Attribute.Component<'form.option', true>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dependsOn: Schema.Attribute.Component<'form.depends-on-item', true>;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    label: Schema.Attribute.String;
    maxLength: Schema.Attribute.Integer;
    messages: Schema.Attribute.Component<'form.messages', false>;
    minLength: Schema.Attribute.Integer;
    placeholder: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    rule: Schema.Attribute.Component<'form.rule', false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    type: Schema.Attribute.String;
  };
}

export interface InputNumberInputStepper extends Struct.ComponentSchema {
  collectionName: 'components_input_number_input_steppers';
  info: {
    displayName: 'numberInputStepper';
    icon: 'cast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dependsOn: Schema.Attribute.Component<'form.depends-on-item', true>;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    editable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
    max: Schema.Attribute.Decimal;
    maxLength: Schema.Attribute.Integer;
    messages: Schema.Attribute.Component<'form.messages', false>;
    min: Schema.Attribute.Decimal;
    minLength: Schema.Attribute.Integer;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    rule: Schema.Attribute.Component<'form.rule', false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    step: Schema.Attribute.Decimal;
    type: Schema.Attribute.String;
  };
}

export interface InputPinInput extends Struct.ComponentSchema {
  collectionName: 'components_input_pin_inputs';
  info: {
    displayName: 'pinInput';
    icon: 'cast';
  };
  attributes: {
    autoFocus: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dependsOn: Schema.Attribute.Component<'form.depends-on-item', true>;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    inputMode: Schema.Attribute.Enumeration<['numeric', 'alphanumeric']> &
      Schema.Attribute.DefaultTo<'numeric'>;
    maxLength: Schema.Attribute.Integer;
    messages: Schema.Attribute.Component<'form.messages', false>;
    minLength: Schema.Attribute.Integer;
    numberOfDigits: Schema.Attribute.Integer;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    rule: Schema.Attribute.Component<'form.rule', false>;
    secureTextEntry: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    type: Schema.Attribute.String;
  };
}

export interface InputRadioButton extends Struct.ComponentSchema {
  collectionName: 'components_input_radio_buttons';
  info: {
    displayName: 'radioButton';
    icon: 'cast';
  };
  attributes: {
    choices: Schema.Attribute.Component<'form.option', true>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dependsOn: Schema.Attribute.Component<'form.depends-on-item', true>;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    groupDirection: Schema.Attribute.Enumeration<['vertical', 'horizontal']> &
      Schema.Attribute.DefaultTo<'vertical'>;
    label: Schema.Attribute.String;
    maxLength: Schema.Attribute.Integer;
    messages: Schema.Attribute.Component<'form.messages', false>;
    minLength: Schema.Attribute.Integer;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    rule: Schema.Attribute.Component<'form.rule', false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    type: Schema.Attribute.String;
  };
}

export interface InputSearchInput extends Struct.ComponentSchema {
  collectionName: 'components_input_search_inputs';
  info: {
    displayName: 'searchInput';
    icon: 'cast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dependsOn: Schema.Attribute.Component<'form.depends-on-item', true>;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    maxLength: Schema.Attribute.Integer;
    messages: Schema.Attribute.Component<'form.messages', false>;
    minLength: Schema.Attribute.Integer;
    placeholder: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    rule: Schema.Attribute.Component<'form.rule', false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    type: Schema.Attribute.String;
  };
}

export interface InputSlider extends Struct.ComponentSchema {
  collectionName: 'components_input_sliders';
  info: {
    displayName: 'slider';
    icon: 'cast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dependsOn: Schema.Attribute.Component<'form.depends-on-item', true>;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    label: Schema.Attribute.String;
    max: Schema.Attribute.Decimal;
    maxLength: Schema.Attribute.Integer;
    messages: Schema.Attribute.Component<'form.messages', false>;
    min: Schema.Attribute.Decimal;
    minLength: Schema.Attribute.Integer;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    rule: Schema.Attribute.Component<'form.rule', false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    step: Schema.Attribute.Decimal;
    type: Schema.Attribute.String;
  };
}

export interface InputTextInput extends Struct.ComponentSchema {
  collectionName: 'components_input_text_inputs';
  info: {
    displayName: 'textInput';
    icon: 'cast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dependsOn: Schema.Attribute.Component<'form.depends-on-item', true>;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    label: Schema.Attribute.String;
    maxLength: Schema.Attribute.Integer;
    messages: Schema.Attribute.Component<'form.messages', false>;
    minLength: Schema.Attribute.Integer;
    placeholder: Schema.Attribute.String;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    rule: Schema.Attribute.Component<'form.rule', false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    type: Schema.Attribute.String;
  };
}

export interface InputToggle extends Struct.ComponentSchema {
  collectionName: 'components_input_toggles';
  info: {
    displayName: 'toggle';
    icon: 'cast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dependsOn: Schema.Attribute.Component<'form.depends-on-item', true>;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    maxLength: Schema.Attribute.Integer;
    messages: Schema.Attribute.Component<'form.messages', false>;
    minLength: Schema.Attribute.Integer;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    rule: Schema.Attribute.Component<'form.rule', false>;
    size: Schema.Attribute.Enumeration<['md', 'lg']> &
      Schema.Attribute.DefaultTo<'md'>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    type: Schema.Attribute.String;
  };
}

export interface InputUploader extends Struct.ComponentSchema {
  collectionName: 'components_input_uploaders';
  info: {
    displayName: 'uploader';
    icon: 'cast';
  };
  attributes: {
    autoUpload: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dependsOn: Schema.Attribute.Component<'form.depends-on-item', true>;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    maxFiles: Schema.Attribute.Integer;
    maxFileSizeBytes: Schema.Attribute.Integer;
    maxLength: Schema.Attribute.Integer;
    messages: Schema.Attribute.Component<'form.messages', false>;
    minLength: Schema.Attribute.Integer;
    required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    rule: Schema.Attribute.Component<'form.rule', false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    type: Schema.Attribute.String;
  };
}

export interface NavigationBottomNavigation extends Struct.ComponentSchema {
  collectionName: 'components_navigation_bottom_navigations';
  info: {
    displayName: 'bottomNavigation';
    icon: 'cast';
  };
  attributes: {
    blurEnabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dynamic: Schema.Attribute.Component<'form.dynamic', false>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
  };
}

export interface NavigationBottomTabItem extends Struct.ComponentSchema {
  collectionName: 'components_navigation_bottom_tab_items';
  info: {
    displayName: 'bottomTabItem';
    icon: 'cast';
  };
  attributes: {
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    iconName: Schema.Attribute.String;
    label: Schema.Attribute.String;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
  };
}

export interface NavigationNavigationHeader extends Struct.ComponentSchema {
  collectionName: 'components_navigation_navigation_headers';
  info: {
    displayName: 'navigationHeader';
    icon: 'cast';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    centerTitle: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    showBackButton: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    title: Schema.Attribute.String;
  };
}

export interface NavigationSectionHeader extends Struct.ComponentSchema {
  collectionName: 'components_navigation_section_headers';
  info: {
    displayName: 'sectionHeader';
    icon: 'cast';
  };
  attributes: {
    color: Schema.Attribute.String;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    title: Schema.Attribute.String;
  };
}

export interface NavigationTab extends Struct.ComponentSchema {
  collectionName: 'components_navigation_tabs';
  info: {
    displayName: 'tab';
    icon: 'cast';
  };
  attributes: {
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    tabKey: Schema.Attribute.String;
  };
}

export interface NavigationToolbar extends Struct.ComponentSchema {
  collectionName: 'components_navigation_toolbars';
  info: {
    displayName: 'toolbar';
    icon: 'cast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    title: Schema.Attribute.String;
  };
}

export interface NavigationTopNavigation extends Struct.ComponentSchema {
  collectionName: 'components_navigation_top_navigations';
  info: {
    displayName: 'topNavigation';
    icon: 'cast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    disableSafeArea: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    paddingTop: Schema.Attribute.Integer;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    title: Schema.Attribute.String;
  };
}

export interface OverlayCoackmarkAndHint extends Struct.ComponentSchema {
  collectionName: 'components_overlay_coackmark_and_hints';
  info: {
    displayName: 'coackmarkAndHint';
  };
  attributes: {
    alignment: Schema.Attribute.Enumeration<['start', 'center', 'end']> &
      Schema.Attribute.DefaultTo<'center'>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.String;
    placement: Schema.Attribute.Enumeration<['top', 'bottom', 'auto']> &
      Schema.Attribute.DefaultTo<'auto'>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    title: Schema.Attribute.String;
  };
}

export interface OverlayEditMenu extends Struct.ComponentSchema {
  collectionName: 'components_overlay_edit_menus';
  info: {
    displayName: 'editMenu';
  };
  attributes: {
    alignment: Schema.Attribute.Enumeration<['start', 'center', 'end']> &
      Schema.Attribute.DefaultTo<'center'>;
    autoSeparator: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    closeOnSelect: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    maxVisibleItems: Schema.Attribute.Integer;
    placement: Schema.Attribute.Enumeration<['auto', 'above', 'below']> &
      Schema.Attribute.DefaultTo<'auto'>;
    showPointer: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
  };
}

export interface StatusAndFeedbackAlertBanner extends Struct.ComponentSchema {
  collectionName: 'components_status_and_feedback_alert_banners';
  info: {
    displayName: 'alertBanner';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    ctaLabel: Schema.Attribute.String;
    linkLabel: Schema.Attribute.String;
    message: Schema.Attribute.String;
    severity: Schema.Attribute.Enumeration<
      ['info', 'warning', 'error', 'success']
    >;
    size: Schema.Attribute.Enumeration<['sm', 'md']>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
  };
}

export interface StatusAndFeedbackBadge extends Struct.ComponentSchema {
  collectionName: 'components_status_and_feedback_badges';
  info: {
    displayName: 'badge';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    iconName: Schema.Attribute.String;
    iconSize: Schema.Attribute.Integer;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    variant: Schema.Attribute.Enumeration<['icon', 'verified', 'drag-drop']>;
  };
}

export interface StatusAndFeedbackProgressIndicator
  extends Struct.ComponentSchema {
  collectionName: 'components_status_and_feedback_progress_indicators';
  info: {
    displayName: 'progressIndicator';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    currentStep: Schema.Attribute.Integer;
    indicatorType: Schema.Attribute.Enumeration<
      ['stepper', 'bar', 'steps', 'circular']
    >;
    progress: Schema.Attribute.Decimal;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    totalSteps: Schema.Attribute.Integer;
  };
}

export interface StatusAndFeedbackToast extends Struct.ComponentSchema {
  collectionName: 'components_status_and_feedback_toasts';
  info: {
    displayName: 'toast';
  };
  attributes: {
    componentId: Schema.Attribute.String & Schema.Attribute.Required;
    dismissible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    duration: Schema.Attribute.Integer;
    message: Schema.Attribute.String;
    position: Schema.Attribute.Enumeration<['top', 'bottom']> &
      Schema.Attribute.DefaultTo<'bottom'>;
    span: Schema.Attribute.Enumeration<['6', '12']> &
      Schema.Attribute.DefaultTo<'12'>;
    variant: Schema.Attribute.Enumeration<['default', 'success', 'error']> &
      Schema.Attribute.DefaultTo<'default'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'action.bottom-quick-action': ActionBottomQuickAction;
      'action.button': ActionButton;
      'action.chip': ActionChip;
      'asset.icon': AssetIcon;
      'asset.image': AssetImage;
      'container.accordion': ContainerAccordion;
      'container.banner': ContainerBanner;
      'container.bento': ContainerBento;
      'container.card': ContainerCard;
      'container.divider': ContainerDivider;
      'container.list': ContainerList;
      'core.avatar': CoreAvatar;
      'core.grid': CoreGrid;
      'core.typo': CoreTypo;
      'form.depends-on-item': FormDependsOnItem;
      'form.dynamic': FormDynamic;
      'form.dynamic-source': FormDynamicSource;
      'form.messages': FormMessages;
      'form.option': FormOption;
      'form.rule': FormRule;
      'form.rule-condition': FormRuleCondition;
      'input.checkbox': InputCheckbox;
      'input.dropdown': InputDropdown;
      'input.number-input-stepper': InputNumberInputStepper;
      'input.pin-input': InputPinInput;
      'input.radio-button': InputRadioButton;
      'input.search-input': InputSearchInput;
      'input.slider': InputSlider;
      'input.text-input': InputTextInput;
      'input.toggle': InputToggle;
      'input.uploader': InputUploader;
      'navigation.bottom-navigation': NavigationBottomNavigation;
      'navigation.bottom-tab-item': NavigationBottomTabItem;
      'navigation.navigation-header': NavigationNavigationHeader;
      'navigation.section-header': NavigationSectionHeader;
      'navigation.tab': NavigationTab;
      'navigation.toolbar': NavigationToolbar;
      'navigation.top-navigation': NavigationTopNavigation;
      'overlay.coackmark-and-hint': OverlayCoackmarkAndHint;
      'overlay.edit-menu': OverlayEditMenu;
      'status-and-feedback.alert-banner': StatusAndFeedbackAlertBanner;
      'status-and-feedback.badge': StatusAndFeedbackBadge;
      'status-and-feedback.progress-indicator': StatusAndFeedbackProgressIndicator;
      'status-and-feedback.toast': StatusAndFeedbackToast;
    }
  }
}
