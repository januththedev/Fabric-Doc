import { mapInquiry, mapMoment, mapReview, mapService } from "@/server/mappers";

const createdAt = new Date("2026-11-17T09:00:00Z");

test("mapMoment renames fields and serialises the date", () => {
  expect(
    mapMoment({
      id: "1",
      imageUrl: "https://images.unsplash.com/z",
      caption: null,
      sourceType: "review",
      reviewerName: "Dilini",
      reviewId: "r1",
      createdAt,
    }),
  ).toEqual({
    id: "1",
    imageSrc: "https://images.unsplash.com/z",
    caption: null,
    sourceType: "review",
    reviewerName: "Dilini",
    reviewId: "r1",
    createdAt: "2026-11-17T09:00:00.000Z",
  });
});

test("mapReview keeps a missing photo as null", () => {
  const r = mapReview({
    id: "1",
    reviewerName: "Dilini",
    serviceType: "Sofa Deep Cleaning",
    rating: 5,
    comment: "Spotless sofa, thank you!",
    imageUrl: null,
    createdAt,
  });
  expect(r.imageSrc).toBeNull();
  expect(r.createdAt).toBe("2026-11-17T09:00:00.000Z");
  expect(r.serviceType).toBe("Sofa Deep Cleaning");
});

test("mapService passes highlights and flags through", () => {
  expect(
    mapService({
      id: "s1",
      slug: "sofa-cleaning",
      title: "Sofa Deep Cleaning",
      shortDesc: "Deep extraction.",
      highlights: ["Stain removal", "Fast dry"],
      imageUrl: "https://images.unsplash.com/z",
      sortOrder: 2,
      isActive: false,
      createdAt,
    }),
  ).toEqual({
    id: "s1",
    slug: "sofa-cleaning",
    title: "Sofa Deep Cleaning",
    shortDesc: "Deep extraction.",
    highlights: ["Stain removal", "Fast dry"],
    imageSrc: "https://images.unsplash.com/z",
    sortOrder: 2,
    isActive: false,
  });
});

test("mapInquiry serialises the date", () => {
  expect(
    mapInquiry({
      id: "i1",
      name: "Kasun",
      phone: "+94771234567",
      serviceType: "Sofa Deep Cleaning",
      city: "Kandy",
      message: "",
      createdAt,
    }).createdAt,
  ).toBe("2026-11-17T09:00:00.000Z");
});
