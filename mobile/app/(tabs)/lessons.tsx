import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const categories = [
  { id: 'all', name: 'All Topics', icon: 'grid' },
  { id: 'basics', name: 'Basics', icon: 'book' },
  { id: 'rituals', name: 'Rituals', icon: 'moon' },
  { id: 'duas', name: 'Duas', icon: 'chatbubble' },
  { id: 'history', name: 'History', icon: 'time' },
];

const lessons = [
  {
    id: 1,
    title: 'Introduction to Umrah',
    subtitle: 'Essential knowledge for first-time pilgrims',
    category: 'basics',
    duration: '12:45',
    thumbnail: require('@/assets/alhilal-assets/Kaaba-hero1.jpg'),
    views: '2.5K',
    completed: false,
  },
  {
    id: 2,
    title: 'How to Perform Tawaf',
    subtitle: 'Step-by-step guide to circumambulation',
    category: 'rituals',
    duration: '18:20',
    thumbnail: require('@/assets/alhilal-assets/about-image.jpg'),
    views: '3.2K',
    completed: true,
  },
  {
    id: 3,
    title: 'Sa\'i Between Safa and Marwah',
    subtitle: 'Understanding the significance and method',
    category: 'rituals',
    duration: '15:30',
    thumbnail: require('@/assets/alhilal-assets/Kaaba-hero.jpg'),
    views: '1.8K',
    completed: false,
  },
  {
    id: 4,
    title: 'Essential Duas for Umrah',
    subtitle: 'Important supplications during pilgrimage',
    category: 'duas',
    duration: '22:15',
    thumbnail: require('@/assets/alhilal-assets/Kaaba-hero1.jpg'),
    views: '4.1K',
    completed: false,
  },
  {
    id: 5,
    title: 'History of the Kaaba',
    subtitle: 'From Prophet Ibrahim to today',
    category: 'history',
    duration: '25:40',
    thumbnail: require('@/assets/alhilal-assets/about-image.jpg'),
    views: '2.9K',
    completed: false,
  },
];

export default function LessonsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLessonPress = (lessonId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to video player
  };

  const filteredLessons =
    selectedCategory === 'all'
      ? lessons
      : lessons.filter((lesson) => lesson.category === selectedCategory);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Umrah Lessons</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            Learn the rituals step by step
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && {
                  backgroundColor: colors.primary,
                },
                selectedCategory !== category.id && {
                  backgroundColor: colors.muted,
                },
              ]}
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={category.icon as any}
                size={18}
                color={
                  selectedCategory === category.id
                    ? colors.primaryForeground
                    : colors.text
                }
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && {
                    color: colors.primaryForeground,
                  },
                  selectedCategory !== category.id && {
                    color: colors.text,
                  },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Progress Overview */}
        <View style={[styles.progressCard, { backgroundColor: colors.card }, Shadow.medium]}>
          <LinearGradient
            colors={[colors.primary, '#A8024E']}
            style={styles.progressGradient}
          >
            <View style={styles.progressContent}>
              <View style={styles.progressLeft}>
                <Ionicons name="trophy" size={32} color={colors.gold} />
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Your Progress</Text>
                  <Text style={styles.progressSubtitle}>
                    {lessons.filter((l) => l.completed).length} of {lessons.length} completed
                  </Text>
                </View>
              </View>
              <View style={styles.progressPercentage}>
                <Text style={styles.progressNumber}>
                  {Math.round((lessons.filter((l) => l.completed).length / lessons.length) * 100)}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(lessons.filter((l) => l.completed).length / lessons.length) * 100}%`,
                    backgroundColor: colors.gold,
                  },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Lessons List */}
        <View style={styles.lessonsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'all' ? 'All Lessons' : categories.find((c) => c.id === selectedCategory)?.name}
          </Text>

          {filteredLessons.map((lesson) => (
            <TouchableOpacity
              key={lesson.id}
              style={[styles.lessonCard, { backgroundColor: colors.card }, Shadow.small]}
              onPress={() => handleLessonPress(lesson.id)}
              activeOpacity={0.9}
            >
              <View style={styles.thumbnailContainer}>
                <Image source={lesson.thumbnail} style={styles.thumbnail} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.thumbnailGradient}
                >
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.durationBadge}>
                    <Ionicons name="time" size={12} color="#FFFFFF" />
                    <Text style={styles.duration}>{lesson.duration}</Text>
                  </View>
                </LinearGradient>
                {lesson.completed && (
                  <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonTitle, { color: colors.text }]} numberOfLines={2}>
                  {lesson.title}
                </Text>
                <Text style={[styles.lessonSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {lesson.subtitle}
                </Text>
                <View style={styles.lessonMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="eye-outline" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {lesson.views}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="bookmark-outline" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      Save
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  categoriesScroll: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  progressCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  progressGradient: {
    padding: Spacing.lg,
  },
  progressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressInfo: {
    gap: 4,
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  progressSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.fontSize.xs,
  },
  progressPercentage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.black,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  lessonsSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  lessonCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  playButton: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  duration: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  completedBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonInfo: {
    padding: Spacing.md,
  },
  lessonTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
  },
});

