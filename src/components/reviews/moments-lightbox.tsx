"use client";

import Lightbox, { type SlideImage } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

/** Loaded lazily by MomentsGallery the first time a photo is opened. */
export default function MomentsLightbox({
  index,
  close,
  slides,
}: {
  index: number;
  close: () => void;
  slides: SlideImage[];
}) {
  return (
    <Lightbox
      open
      index={index}
      close={close}
      plugins={[Captions]}
      slides={slides}
      controller={{ closeOnBackdropClick: true }}
    />
  );
}
