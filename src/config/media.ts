import raw from "./media.json";
import type { DefaultServiceId } from "./business";

export type ImageAsset = { src: string; alt: string };

type Media = {
  hero: ImageAsset;
  about: ImageAsset;
  services: Record<DefaultServiceId, ImageAsset>;
  seedReviews: [ImageAsset, ImageAsset, ImageAsset];
  adminSeed: [ImageAsset, ImageAsset];
  gallery: Record<
    | "sofaVacuum" | "carpetSanitize" | "proVacuum" | "rugVacuum" | "rugWash" | "familyDog" | "kidsDog"
    | "familyPug" | "coffeeSpill" | "cushions" | "fabricTexture" | "bedMaking",
    ImageAsset
  >;
};

/** Photography for the default content. Edit URLs in media.json, then run `npm run check:media`. */
export const MEDIA = raw as unknown as Media;
