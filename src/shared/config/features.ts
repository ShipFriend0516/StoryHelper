export interface FeatureConfig {
  key: string;
  messageKey: string;
  isNew: boolean;
}

export const FEATURES: FeatureConfig[] = [
  { key: 'func_0', messageKey: 'feature_extra_shortcuts', isNew: false },
  { key: 'func_1', messageKey: 'feature_alt_tagger', isNew: false },
  { key: 'func_2', messageKey: 'feature_image_resizer', isNew: false },
  { key: 'func_3', messageKey: 'feature_text_counter', isNew: false },
  { key: 'func_4', messageKey: 'feature_seo_checker', isNew: false },
  { key: 'func_5', messageKey: 'feature_preview_side_view', isNew: true },
];
