require("dotenv").config();
const mongoose = require("mongoose");
const BookModel = require("./models/book.model");
const connectDB = require("./config/db");

const sampleBooks = [
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "Technology & Coding",
    price: 649,
    discountPrice: 549,
    rating: 4.8,
    isbn: "978-0132350884",
    publicationYear: 2008,
    publisher: "Prentice Hall",
    pages: 464,
    stock: 25,
    description:
      "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. This book is a must-read for any developer, software engineer, project manager, team lead, or systems analyst with an interest in producing better code.",
    coverImage:
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80",
    language: "English",
    format: "Paperback",
    featured: true,
  },
  {
    title: "The Pragmatic Programmer: Your Journey To Mastery",
    author: "David Thomas & Andrew Hunt",
    category: "Technology & Coding",
    price: 799,
    discountPrice: 699,
    rating: 4.9,
    isbn: "978-0135957059",
    publicationYear: 2019,
    publisher: "Addison-Wesley",
    pages: 352,
    stock: 18,
    description:
      "The Pragmatic Programmer is one of those rare tech audiobooks you'll listen to, read, and reread over the years. Whether you're new to the field or an experienced practitioner, you'll come away with fresh insights every time. Dave Thomas and Andy Hunt wrote the first edition of this influential book in 1999 to help their clients create better software.",
    coverImage:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    language: "English",
    format: "Hardcover",
    featured: true,
  },
  {
    title: "Atomic Habits: An Easy & Proven Way to Build Good Habits",
    author: "James Clear",
    category: "Self-Help",
    price: 499,
    discountPrice: 399,
    rating: 4.9,
    isbn: "978-0735211292",
    publicationYear: 2018,
    publisher: "Avery",
    pages: 320,
    stock: 40,
    description:
      "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    coverImage:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    language: "English",
    format: "Paperback",
    featured: true,
  },
  {
    title: "The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness",
    author: "Morgan Housel",
    category: "Business & Finance",
    price: 399,
    discountPrice: 320,
    rating: 4.7,
    isbn: "978-0857197689",
    publicationYear: 2020,
    publisher: "Harriman House",
    pages: 256,
    stock: 35,
    description:
      "Doing well with money isn't necessarily about what you know. It's about how you behave. And behavior is hard to teach, even to really smart people. Money—investing, personal finance, and business decisions—is typically taught as a math-based field, where data and formulas tell us exactly what to do. But in the real world, people make financial decisions around their own life stories.",
    coverImage:
      "https://images.unsplash.com/photo-1554415707-9e49017aed81?auto=format&fit=crop&w=600&q=80",
    language: "English",
    format: "Paperback",
    featured: false,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    category: "Sci-Fi & Fantasy",
    price: 599,
    discountPrice: 479,
    rating: 4.8,
    isbn: "978-0441013593",
    publicationYear: 1965,
    publisher: "Chilton Books",
    pages: 688,
    stock: 22,
    description:
      "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness. Coveted across the known universe, melange is a prize worth killing for.",
    coverImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    language: "English",
    format: "Paperback",
    featured: true,
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    category: "Fiction",
    price: 350,
    discountPrice: 299,
    rating: 4.9,
    isbn: "978-0060935467",
    publicationYear: 1960,
    publisher: "J. B. Lippincott & Co.",
    pages: 336,
    stock: 15,
    description:
      "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, 'To Kill A Mockingbird' became both an instant bestseller and a critical triumph. It is compassionate, dramatic, and deeply moving.",
    coverImage:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    language: "English",
    format: "Paperback",
    featured: false,
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    category: "History",
    price: 550,
    discountPrice: 450,
    rating: 4.7,
    isbn: "978-0062316097",
    publicationYear: 2014,
    publisher: "Harper",
    pages: 464,
    stock: 28,
    description:
      "One hundred thousand years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens. How did our species succeed in the battle for dominance? Why did our foraging ancestors come together to create cities and kingdoms? How did we come to believe in gods, nations and human rights?",
    coverImage:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
    language: "English",
    format: "Hardcover",
    featured: true,
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    category: "Mystery & Thriller",
    price: 420,
    discountPrice: 349,
    rating: 4.6,
    isbn: "978-1250301696",
    publicationYear: 2019,
    publisher: "Celadon Books",
    pages: 336,
    stock: 19,
    description:
      "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house overlooking a park in one of London's most desirable areas. One evening, she shoots her husband five times in the face and never speaks another word.",
    coverImage:
      "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
    language: "English",
    format: "Paperback",
    featured: false,
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    category: "Biography",
    price: 699,
    discountPrice: 599,
    rating: 4.7,
    isbn: "978-1451648539",
    publicationYear: 2011,
    publisher: "Simon & Schuster",
    pages: 656,
    stock: 14,
    description:
      "Based on more than forty interviews with Jobs conducted over two years—as well as interviews with more than a hundred family members, friends, adversaries, competitors, and colleagues—Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur whose passion for perfection and ferocious drive revolutionized six industries.",
    coverImage:
      "https://images.unsplash.com/photo-1507842229451-7f01be7fe8e7?auto=format&fit=crop&w=600&q=80",
    language: "English",
    format: "Hardcover",
    featured: false,
  },
  {
    title: "Deep Work: Rules for Focused Success in a Distracted World",
    author: "Cal Newport",
    category: "Self-Help",
    price: 450,
    discountPrice: 380,
    rating: 4.8,
    isbn: "978-1455586691",
    publicationYear: 2016,
    publisher: "Grand Central Publishing",
    pages: 304,
    stock: 30,
    description:
      "Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship.",
    coverImage:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80",
    language: "English",
    format: "Paperback",
    featured: false,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("[Seed] Checking existing books...");

    const count = await BookModel.countDocuments();
    if (count > 0) {
      console.log(`[Seed] Database already contains ${count} books. Clearing for fresh seed...`);
      await BookModel.deleteMany({});
    }

    console.log("[Seed] Inserting sample books...");
    const createdBooks = await BookModel.insertMany(sampleBooks);
    console.log(`[Seed] Successfully seeded ${createdBooks.length} books into the database!`);

    process.exit(0);
  } catch (error) {
    console.error("[Seed Error] Failed to seed database:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { sampleBooks, seedDatabase };
