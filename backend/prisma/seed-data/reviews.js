// =====================================================
// REVIEW DATA GENERATOR
// =====================================================
//
// 3000 reviews in total
// - 3000 ratings
// - 1500 reviews with comments
// - 1500 reviews without comments
//
// reviewIndex: 0 - 2999
// =====================================================


// =====================================================
// RANDOM RATING
// =====================================================

function generateRating() {

    const random = Math.random();

    // Most ratings are positive,
    // but lower ratings also exist.

    if (random < 0.50) return 5;
    if (random < 0.82) return 4;
    if (random < 0.94) return 3;
    if (random < 0.98) return 2;

    return 1;
}


// =====================================================
// COMMENT PARTS
// =====================================================

const commentStarts = [

    "غذا",
    "سفارش",
    "این سفارش",
    "این غذا",
    "غذایی که سفارش دادم",
    "سفارشم",
    "کیفیت غذا",
    "طعم غذا"

];


const commentPositive = [

    "خیلی خوشمزه بود",
    "طعم خیلی خوبی داشت",
    "واقعاً راضی‌کننده بود",
    "کیفیت خوبی داشت",
    "خیلی تازه و خوش‌طعم بود",
    "واقعاً ازش راضی بودم",
    "خیلی بهتر از چیزی بود که انتظار داشتم",
    "طعمش عالی بود",
    "خیلی خوب و باکیفیت بود",
    "کاملاً راضی بودم",
    "تازه و گرم به دستم رسید",
    "خیلی خوش‌طعم و تازه بود"

];


const commentNeutral = [

    "خوب بود ولی چیز خاصی نداشت",
    "قابل قبول بود",
    "در مجموع بد نبود",
    "کیفیت متوسطی داشت",
    "طعمش معمولی بود",
    "در حد انتظار بود",
    "می‌توانست بهتر باشد",
    "نسبت به انتظارم معمولی بود",
    "در کل تجربه قابل قبولی بود",
    "کیفیت مناسبی داشت"

];


const commentNegative = [

    "کمی شور بود",
    "کمی سرد شده بود",
    "کمی چرب بود",
    "کمی خشک شده بود",
    "زمان ارسال کمی طولانی شد",
    "مقدارش می‌توانست بیشتر باشد",
    "سس کمی کم بود",
    "انتظار داشتم گرم‌تر باشد",
    "طعمش می‌توانست بهتر باشد",
    "نسبت به قیمتش می‌توانست بهتر باشد"

];


const commentEndings = [

    "دوباره سفارش می‌دم.",
    "احتمالاً دوباره امتحانش می‌کنم.",
    "از انتخابم راضی بودم.",
    "در مجموع تجربه خوبی بود.",
    "برای دفعه بعد هم انتخابش می‌کنم.",
    "به نظرم ارزش امتحان کردن دارد.",
    "در کل سفارش خوبی بود.",
    "احتمالاً دوباره سفارش می‌دهم.",
    "از سفارشم راضی بودم.",
    "تجربه خوبی داشتم."

];


// =====================================================
// RANDOM ITEM
// =====================================================

function randomItem(array) {

    return array[
        Math.floor(Math.random() * array.length)
    ];

}


// =====================================================
// GENERATE COMMENT
// =====================================================

function generateComment() {

    const type = Math.random();

    // Positive comment
    if (type < 0.60) {

        return `${randomItem(commentStarts)} ${randomItem(commentPositive)}. ${randomItem(commentEndings)}`;

    }

    // Neutral comment
    if (type < 0.85) {

        return `${randomItem(commentStarts)} ${randomItem(commentNeutral)}. ${randomItem(commentEndings)}`;

    }

    // Negative comment
    return `${randomItem(commentStarts)} ${randomItem(commentNegative)}. ${randomItem(commentEndings)}`;

}


// =====================================================
// CREATE REVIEW DATA
// =====================================================

export const reviewData = Array.from(
    { length: 3000 },
    (_, index) => {

        const review = {

            reviewIndex: index,

            rating: generateRating()

        };


        // First 1500 reviews have comments.
        // Remaining 1500 are rating-only.

        if (index < 1500) {

            review.comment =
                generateComment();

        }


        return review;

    }
);