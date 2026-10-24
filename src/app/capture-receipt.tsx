import React from 'react';
import { Redirect } from 'expo-router';

export default function CaptureReceiptRedirect() {
  return <Redirect href="/scanner?mode=receipt" />;
}
