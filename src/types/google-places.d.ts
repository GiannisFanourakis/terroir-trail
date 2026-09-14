import type React from 'react';

interface GmpPlaceDetailsProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  role?: string;
  children?: React.ReactNode;
}

interface GmpPlaceDetailsLocationRequestProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  location?: string;
}

interface GmpPlaceDetailsPlaceRequestProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  place?: string;
}

interface GmpPlaceContentConfigProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  children?: React.ReactNode;
}

interface GmpPlaceMediaProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  'lightbox-preferred'?: boolean | string;
}

interface GmpPlaceAttributionProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  'light-scheme-color'?: string;
  'dark-scheme-color'?: string;
  children?: React.ReactNode;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-details': GmpPlaceDetailsProps;
      'gmp-place-details-location-request': GmpPlaceDetailsLocationRequestProps;
      'gmp-place-details-place-request': GmpPlaceDetailsPlaceRequestProps;
      'gmp-place-content-config': GmpPlaceContentConfigProps;
      'gmp-place-media': GmpPlaceMediaProps;
      'gmp-place-attribution': GmpPlaceAttributionProps;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-details': GmpPlaceDetailsProps;
      'gmp-place-details-location-request': GmpPlaceDetailsLocationRequestProps;
      'gmp-place-details-place-request': GmpPlaceDetailsPlaceRequestProps;
      'gmp-place-content-config': GmpPlaceContentConfigProps;
      'gmp-place-media': GmpPlaceMediaProps;
      'gmp-place-attribution': GmpPlaceAttributionProps;
    }
  }
}
