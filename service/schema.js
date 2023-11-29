const DOMAIN = process.env.DOMAIN

const breadcumbCourse = (parent, course) => {
  if (parent == null) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": 'course',
        "item": `${process.env.DOMAIN}/course`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": course.name,
        "item": `${process.env.DOMAIN}/course/${course.slug}`
      }]
    }
    return schema
  }

  let rawItemlists = breadcumbCourseTopic(parent).itemListElement



  const schemaBreadcum = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [...rawItemlists,
    {
      "@type": "ListItem",
      "position": rawItemlists.slice(-1)[0].position + 1,
      "name": course.name,
      "item": `${process.env.DOMAIN}/course/${course.slug}`
    }]
  }

  return schemaBreadcum
}

const breadcumbCourseTopic = (breadcrumb) => {
  let rawItemlists = breadcrumb.parents.map((item, index) => {
    return {
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${process.env.DOMAIN}/topic/${item.name}`
    }
  })
  rawItemlists = [...rawItemlists, {
    "@type": "ListItem",
    "position": rawItemlists.slice(-1)[0]?.position + 1 || 1,
    "name": breadcrumb.category.name,
    "item": `${process.env.DOMAIN}/topic/${breadcrumb.category.slug}`
  }]
  const schemaBreadcum = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": rawItemlists
  }
  return schemaBreadcum
}

const breadcrumbBlogCate = (Cate) => {
  const schema = [{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Blog",
      "item": `${DOMAIN}/blog`
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": `${Cate.name}`,
      "item": `${DOMAIN}/category/${Cate.slug}`
    }]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": `${Cate.name}`,
      "item": `${DOMAIN}/category/${Cate.slug}`
    }]
  }]
  return schema
}

const schemaBlog = (blog) => {
  const raw = breadcrumbBlogCate(blog.Category)
  const schema = raw.map(item => {
    const newItemListElement = {
      "@type": "ListItem",
      "position": item.itemListElement.slice(-1)[0].position + 1,
      "name": `${blog.title}`,
      "item": `${DOMAIN}/${blog.slug}`
    };
    item.itemListElement.push(newItemListElement);
    return item;
  })
  return schema
}

const home = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Full Bootcamp",
    "logo": "https://fullbootcamp.com/img/redketchup/apple-touch-icon.png",
    "description": "Website hộ trợ tải khoá học Udemy giá rẻ",
    "url": "https:/fullbootcamp.com/",
    "telephone": "0946645803",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "99 Trích sài",
      "addressLocality": "Tây hồ",
      "addressRegion": "Hà Nội",
      "postalCode": "100000",
      "addressCountry": "VN"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://www.facebook.com/fullbootcamp3",
      "https://www.youtube.com/@fullbootcamp3456",
    ]
  }
  return schema
}

const CreativeWorkSeries = (course, ratings) => {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "CreativeWorkSeries",
    "name": course.name,
    "aggregateRating":
    {
      "@type": "AggregateRating",
      "ratingValue": ratings.avg,
      "bestRating": "5",
      "ratingCount": course.Topics.length
    }
  }
  return schema
}

const handleProviderStructure = (url) => {

  if (url.includes("unica")) {
    return {
      "@type": "Organization",
      "name": "Unica",
      "sameAs": "https://unica.vn/"
    }
  }
  if (url.includes("udemy")) {
    return {
      "@type": "Organization",
      "name": "Udemy",
      "sameAs": "https://www.udemy.com/"
    }
  }
  if (url.includes("cyberlearn")) {
    return {
      "@type": "Organization",
      "name": "Cyberlearn",
      "sameAs": "https://cyberlearn.vn/"
    }
  }
  if (url.includes("gitiho")) {
    return {
      "@type": "Organization",
      "name": "gitiho",
      "sameAs": "https://gitiho.com/"
    }
  }
}

const createStrucDataCourses = (courses) => {
  const itemListElement = courses.map((item, index) => {

    return {
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Course",
        "url": `${process.env.DOMAIN}/course/${item.slug}`,
        "name": item.name,
        "description": item.description,
        "provider": handleProviderStructure(item.url)
      }
    }
  })
  const structuredDataCourse = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement
  }
  return structuredDataCourse
}

const createStrucDataOneCourse = (course,ratings) => {
  const structuredDataCourse = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "provider": handleProviderStructure(course.url)
    ,
    "@id":  course.url,

    "isAccessibleForFree": course.price == 0 ? true : false,
    "image": course.image,
    "offers": [
      {
        "@type": "Offer",
        "category": "Paid",
        "price": course.priceus,
        "priceCurrency": "USD"
      },
      {
        "@type": "Offer",
        "category": "Paid",
        "price": course.price,
        "priceCurrency": "VND"
      }
    ],
  
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratings.avg || 0,
      "ratingCount": course.ratings.length,
      "bestRating": 5,
      "worstRating": 0.5
    }

  }
  return structuredDataCourse
}

const blogPage = (blog) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "image": [blog.thumbnail],
    "description": blog.description,
    "datePublished": blog.createdAt,
    "dateModified": blog.updatedAt,
    "articleBody":blog.content,
    "author": {
      "@type": "EducationalOrganization",
      "url": process.env.DOMAIN,
      "name": "Full Bootcamp"
    },
    "publisher": { 
      "@type": "EducationalOrganization", 
      "url": process.env.DOMAIN,
    name: "Full Bootcamp" }
  }
  return schema
}
module.exports = { schemaBlog, breadcumbCourse, breadcumbCourseTopic, breadcrumbBlogCate, home, CreativeWorkSeries, createStrucDataOneCourse, createStrucDataCourses,blogPage }