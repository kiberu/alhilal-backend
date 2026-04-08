import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useGuestTheme } from '@/lib/guest/theme';

type ButtonSize = 'md' | 'lg';

type BaseButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  size?: ButtonSize;
};

function buttonHeight(size: ButtonSize) {
  return size === 'lg' ? 58 : 50;
}

export function PrimaryPillButton({
  label,
  onPress,
  icon,
  fullWidth,
  loading,
  disabled,
  size = 'md',
}: BaseButtonProps) {
  const theme = useGuestTheme();
  const buttonIcon = icon;

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        {
          backgroundColor: theme.palette.primary,
          borderWidth: 1,
          borderColor: theme.palette.primaryStrong,
          minHeight: buttonHeight(size),
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.5 : 1,
          paddingLeft: buttonIcon ? 18 : 22,
          paddingRight: buttonIcon ? 10 : 22,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
    >
      {loading ? (
        <ActivityIndicator color={theme.palette.primaryForeground} />
      ) : (
        <>
          <Text
            style={[
              styles.buttonLabel,
              {
                color: theme.palette.primaryForeground,
                fontSize: size === 'lg' ? theme.typography.body.fontSize : theme.typography.bodySm.fontSize,
              },
            ]}
          >
            {label}
          </Text>
          {buttonIcon ? (
            <View
              style={[
                styles.buttonIconWrap,
                size === 'lg' ? styles.buttonIconWrapLarge : null,
                { backgroundColor: `${theme.palette.primaryForeground}24` },
              ]}
            >
              <Ionicons name={buttonIcon} size={18} color={theme.palette.primaryForeground} />
            </View>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryPillButton({
  label,
  onPress,
  icon,
  fullWidth,
  loading,
  disabled,
  size = 'md',
}: BaseButtonProps) {
  const theme = useGuestTheme();
  const buttonIcon = icon;

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        {
          backgroundColor: theme.palette.surface,
          borderWidth: 1,
          borderColor: theme.palette.border,
          minHeight: buttonHeight(size),
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.5 : 1,
          paddingLeft: buttonIcon ? 18 : 22,
          paddingRight: buttonIcon ? 10 : 22,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
    >
      {loading ? (
        <ActivityIndicator color={theme.palette.primary} />
      ) : (
        <>
          <Text
            style={[
              styles.buttonLabel,
              {
                color: theme.palette.primary,
                fontSize: size === 'lg' ? theme.typography.body.fontSize : theme.typography.bodySm.fontSize,
              },
            ]}
          >
            {label}
          </Text>
          {buttonIcon ? (
            <View
              style={[
                styles.buttonIconWrap,
                size === 'lg' ? styles.buttonIconWrapLarge : null,
                { backgroundColor: theme.palette.primarySoft },
              ]}
            >
              <Ionicons name={buttonIcon} size={18} color={theme.palette.primary} />
            </View>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}

type TopBarProps = {
  title: string;
  subtitle?: string;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  onLeadingPress?: () => void;
  trailing?: React.ReactNode;
};

export function TopBar({ title, subtitle, leadingIcon, onLeadingPress, trailing }: TopBarProps) {
  const theme = useGuestTheme();

  return (
    <View style={styles.topBar}>
      <View style={styles.topBarMain}>
        {leadingIcon ? (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.palette.surface, borderColor: theme.palette.border }]}
            onPress={onLeadingPress}
            activeOpacity={0.85}
          >
            <Ionicons name={leadingIcon} size={18} color={theme.palette.text} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.topBarCopy}>
          <Text style={[styles.topBarTitle, { color: theme.palette.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.topBarSubtitle, { color: theme.palette.mutedText }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {trailing ? <View>{trailing}</View> : null}
    </View>
  );
}

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  const theme = useGuestTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderTitle, { color: theme.palette.text }]}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.8}>
          <Text style={[styles.sectionHeaderAction, { color: theme.palette.primary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

type SearchInputProps = {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
};

export function SearchInput({ placeholder, value, onChangeText }: SearchInputProps) {
  const theme = useGuestTheme();

  return (
    <View style={[styles.searchWrap, { backgroundColor: theme.palette.surface, borderColor: theme.palette.border }]}>
      <Ionicons name="search-outline" size={18} color={theme.palette.mutedText} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.palette.mutedText}
        style={[styles.searchInput, { color: theme.palette.text }]}
      />
    </View>
  );
}

type ProofChipRowProps = {
  items: readonly string[] | string[];
};

export function ProofChipRow({ items }: ProofChipRowProps) {
  const theme = useGuestTheme();

  return (
    <View style={styles.chipRow}>
      {items.map((item) => (
        <View
          key={item}
          style={[
            styles.chip,
            {
              backgroundColor: theme.palette.surface,
              borderColor: theme.palette.border,
            },
          ]}
        >
          <View style={[styles.chipDot, { backgroundColor: theme.palette.accent }]} />
          <Text style={[styles.chipLabel, { color: theme.palette.text }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

type QuickActionTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export function QuickActionTile({ icon, label, onPress }: QuickActionTileProps) {
  const theme = useGuestTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickActionTile,
        {
          backgroundColor: pressed ? theme.palette.surfaceMuted : theme.palette.card,
          borderColor: theme.palette.border,
        },
      ]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: theme.palette.primarySoft }]}>
        <Ionicons name={icon} size={20} color={theme.palette.primary} />
      </View>
      <Text style={[styles.quickActionLabel, { color: theme.palette.text }]}>{label}</Text>
    </Pressable>
  );
}

type MenuListItemProps = {
  label: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'card' | 'list';
  onPress: () => void;
};

export function MenuListItem({
  label,
  description,
  icon = 'ellipse-outline',
  variant = 'card',
  onPress,
}: MenuListItemProps) {
  const theme = useGuestTheme();
  const isList = variant === 'list';

  return (
    <TouchableOpacity
      style={[
        styles.menuListItem,
        isList ? styles.menuListItemList : styles.menuListItemCard,
        {
          backgroundColor: isList ? 'transparent' : theme.palette.card,
          borderColor: theme.palette.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.menuLeading}>
        <View style={[styles.menuIconTile, { backgroundColor: theme.palette.primarySoft }]}>
          <Ionicons name={icon} size={18} color={theme.palette.primary} />
        </View>
        <View style={styles.menuCopy}>
          <Text style={[styles.menuLabel, { color: theme.palette.text }]}>{label}</Text>
          {description ? (
            <Text style={[styles.menuDescription, { color: theme.palette.mutedText }]}>{description}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.palette.mutedText} />
    </TouchableOpacity>
  );
}

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const theme = useGuestTheme();

  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: selected ? theme.palette.primary : theme.palette.surface,
          borderColor: selected ? theme.palette.primary : theme.palette.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <Text style={[styles.filterChipLabel, { color: selected ? theme.palette.primaryForeground : theme.palette.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type InfoPromptCardProps = {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
  cta?: React.ReactNode;
};

export function InfoPromptCard({ title, body, icon = 'sparkles-outline', cta }: InfoPromptCardProps) {
  const theme = useGuestTheme();

  return (
    <View
      style={[
        styles.infoCard,
        {
          backgroundColor: theme.palette.surface,
          borderColor: theme.palette.border,
        },
      ]}
    >
      <View style={styles.infoCardHeader}>
        <View style={[styles.infoIcon, { backgroundColor: theme.palette.primarySoft }]}>
          <Ionicons name={icon} size={18} color={theme.palette.primary} />
        </View>
        <Text style={[styles.infoTitle, { color: theme.palette.text }]}>{title}</Text>
      </View>
      <Text style={[styles.infoBody, { color: theme.palette.mutedText }]}>{body}</Text>
      {cta}
    </View>
  );
}

type StatusNoticeProps = {
  message: string;
};

export function StatusNotice({ message }: StatusNoticeProps) {
  const theme = useGuestTheme();

  return (
    <View
      style={[
        styles.notice,
        {
          backgroundColor: theme.palette.accentSoft,
          borderColor: theme.palette.accent,
        },
      ]}
    >
      <Ionicons name="wifi-outline" size={18} color={theme.palette.warning} />
      <Text style={[styles.noticeText, { color: theme.palette.warning }]}>{message}</Text>
    </View>
  );
}

type EmptyStateCardProps = {
  title: string;
  body: string;
};

export function EmptyStateCard({ title, body }: EmptyStateCardProps) {
  const theme = useGuestTheme();

  return (
    <View
      style={[
        styles.emptyState,
        {
          backgroundColor: theme.palette.surface,
          borderColor: theme.palette.border,
        },
      ]}
    >
      <Text style={[styles.emptyStateTitle, { color: theme.palette.text }]}>{title}</Text>
      <Text style={[styles.emptyStateBody, { color: theme.palette.mutedText }]}>{body}</Text>
    </View>
  );
}

export function LoadingScreen({ message }: { message: string }) {
  const theme = useGuestTheme();

  return (
    <View style={[styles.loadingScreen, { backgroundColor: theme.palette.canvas }]}>
      <ActivityIndicator size="large" color={theme.palette.primary} />
      <Text style={[styles.loadingText, { color: theme.palette.mutedText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 10,
  },
  buttonLabel: {
    fontWeight: '700',
    letterSpacing: 0.15,
    flexShrink: 1,
  },
  buttonIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconWrapLarge: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  topBarMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCopy: {
    flex: 1,
    gap: 2,
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  topBarSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  sectionHeaderAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchWrap: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionTile: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  menuListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  menuListItemCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  menuListItemList: {
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  menuLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconTile: {
    width: 42,
    height: 42,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCopy: {
    flex: 1,
    gap: 4,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  menuDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  infoBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  notice: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  emptyState: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 8,
    alignItems: 'flex-start',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyStateBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
  },
});
