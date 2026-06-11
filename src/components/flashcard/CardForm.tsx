import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { spacing, screenPadding } from '@/constants/theme';
import { Input, Button } from '@/components/ui';

export interface CardFormValues {
  front: string;
  back: string;
  example: string;
}

interface CardFormProps {
  initialValues?: CardFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: CardFormValues) => void;
}

const EMPTY_VALUES: CardFormValues = { front: '', back: '', example: '' };

export function CardForm({ initialValues, submitLabel, isSubmitting, onSubmit }: CardFormProps) {
  const [values, setValues] = useState<CardFormValues>(initialValues ?? EMPTY_VALUES);

  const canSubmit = values.front.trim().length > 0 && values.back.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) return;
    onSubmit({
      front: values.front.trim(),
      back: values.back.trim(),
      example: values.example.trim(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Front (Word/Question)"
          placeholder="Enter the word or question"
          value={values.front}
          onChangeText={(front) => setValues((v) => ({ ...v, front }))}
          multiline
          editable={!isSubmitting}
          containerStyle={styles.field}
        />
        <Input
          label="Back (Answer/Meaning)"
          placeholder="Enter the answer or meaning"
          value={values.back}
          onChangeText={(back) => setValues((v) => ({ ...v, back }))}
          multiline
          editable={!isSubmitting}
          containerStyle={styles.field}
        />
        <Input
          label="Example Sentence (optional)"
          placeholder="Enter an example sentence using the word"
          value={values.example}
          onChangeText={(example) => setValues((v) => ({ ...v, example }))}
          multiline
          editable={!isSubmitting}
          containerStyle={styles.field}
        />

        <Button
          variant="primary"
          size="large"
          disabled={!canSubmit || isSubmitting}
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: screenPadding,
    paddingTop: 0,
  },
  field: {
    marginBottom: spacing[4],
  },
  submitButton: {
    marginTop: spacing[2],
  },
});
