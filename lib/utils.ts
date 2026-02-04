/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date | string) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-US',
    dateTimeOptions
  )

  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-US',
    dateOptions
  )

  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-US',
    timeOptions
  )

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  }
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file)

export const formatPrice = (price: string) => {
  const amount = parseFloat(price)
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)

  return formattedPrice
}

export function formUrlQuery({ params, key, value }: { params: string, key: string, value: string | null }) {
  const currentUrl = new URLSearchParams(params);

  if (value) {
    currentUrl.set(key, value);
  } else {
    currentUrl.delete(key);
  }

  return `${window.location.pathname}?${currentUrl.toString()}`;
}

export function removeKeysFromQuery({ params, keysToRemove }: { params: string, keysToRemove: string[] }) {
  const currentUrl = new URLSearchParams(params);

  keysToRemove.forEach(key => {
    currentUrl.delete(key)
  })

  return `${window.location.pathname}?${currentUrl.toString()}`;
}

// HANDLE ERROR
export const handleError = (error: unknown) => {
  console.error(error)
  if (error instanceof Error) {
    console.error(error.message);
    throw new Error(`Error: ${error.message}`)
  } else if (typeof error === "string") {
    console.error(error);
    throw new Error(`Error: ${error}`)
  } else {
    console.error(error);
    throw new Error(`Unknown error: ${JSON.stringify(error)}`)
  }
}
