import { saveMotorcycle, type Motorcycle } from './motorcycles';

// Initial motorcycle data to seed the database
const initialMotorcycles: Motorcycle[] = [
  {
    id: 1,
    name: 'Airborne',
    category: 'sport',
    price: '$12,500',
    image: 'https://images.unsplash.com/photo-1640237039271-46cc45fb3dbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjByYWNpbmclMjBiaWtlfGVufDF8fHx8MTc3MDA2MDQwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    gallery: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200',
    ],
    description: 'A high-performance sport bike designed for speed and agility. The Airborne features cutting-edge aerodynamics and a powerful engine that delivers an exhilarating riding experience.',
    specs: [
      'Engine: 600cc Inline-4',
      'Power: 120 HP @ 13,500 RPM',
      'Weight: 410 lbs',
      'Top Speed: 165 mph',
      '0-60 mph: 3.2 seconds',
      'Fuel Capacity: 4.5 gallons',
    ],
    isDaytonaSeries: true,
    isForSale: true,
  },
  {
    id: 2,
    name: 'Sport Racer 1000',
    category: 'sport',
    price: '$18,900',
    image: 'https://images.unsplash.com/photo-1656414760392-5dbd778c59e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGV8ZW58MXx8fHwxNjY2ODM5NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    gallery: [
      'https://images.unsplash.com/photo-1599819177795-f094c9f0f1e6?w=1200',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200',
    ],
    description: 'The ultimate track weapon with race-inspired technology and blistering acceleration.',
    specs: [
      'Engine: 1000cc Inline-4',
      'Power: 180 HP @ 14,000 RPM',
      'Weight: 440 lbs',
      'Top Speed: 186 mph',
    ],
    isDaytonaSeries: false,
    isForSale: true,
  },
  {
    id: 3,
    name: 'Highway Cruiser 850',
    category: 'cruiser',
    price: '$15,750',
    image: 'https://images.unsplash.com/photo-1648300117829-d9e207740785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnVpc2VyJTIwbW90b3JjeWNsZXxlbnwxfHx8fDE3NjY2ODM5NDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Classic American styling meets modern comfort for endless highway miles.',
    specs: [
      'Engine: 850cc V-Twin',
      'Power: 68 HP @ 5,500 RPM',
      'Weight: 650 lbs',
      'Fuel Capacity: 5.5 gallons',
    ],
    isDaytonaSeries: true,
    isForSale: false,
  },
  {
    id: 4,
    name: 'Adventure Tourer 900',
    category: 'adventure',
    price: '$16,200',
    image: 'https://images.unsplash.com/photo-1666907418714-1b5f85aaf146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjBtb3RvcmN5Y2xlfGVufDF8fHx8MTc2NjY4Mzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Go anywhere, do anything. Built for both paved roads and off-road adventures.',
    specs: [
      'Engine: 900cc Parallel Twin',
      'Power: 95 HP @ 8,500 RPM',
      'Weight: 480 lbs',
      'Fuel Capacity: 6.3 gallons',
    ],
    isDaytonaSeries: false,
    isForSale: false,
  },
  {
    id: 5,
    name: 'Retro Classic 650',
    category: 'vintage',
    price: '$11,800',
    image: 'https://images.unsplash.com/photo-1550199318-892e28034076?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbW90b3JiaWtlfGVufDF8fHx8MTc2Njc1NjU1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Timeless design with modern reliability. A tribute to the golden age of motorcycling.',
    specs: [
      'Engine: 650cc Single Cylinder',
      'Power: 47 HP @ 7,200 RPM',
      'Weight: 420 lbs',
      'Classic air-cooled engine',
    ],
    isDaytonaSeries: true,
    isForSale: true,
  },
  {
    id: 6,
    name: 'Performance Sport 1200',
    category: 'sport',
    price: '$22,500',
    image: 'https://images.unsplash.com/photo-1656414760392-5dbd778c59e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGV8ZW58MXx8fHwxNjY2ODM5NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Flagship superbike with cutting-edge electronics and unmatched performance.',
    specs: [
      'Engine: 1200cc V4',
      'Power: 210 HP @ 14,500 RPM',
      'Weight: 430 lbs',
      'Top Speed: 200+ mph',
    ],
    isDaytonaSeries: false,
    isForSale: true,
  },
  {
    id: 7,
    name: 'Boulevard Cruiser 1100',
    category: 'cruiser',
    price: '$17,900',
    image: 'https://images.unsplash.com/photo-1648300117829-d9e207740785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnVpc2VyJTIwbW90b3JjeWNsZXxlbnwxfHx8fDE3NjY2ODM5NDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Luxurious touring cruiser with premium comfort features for long-distance riding.',
    specs: [
      'Engine: 1100cc V-Twin',
      'Power: 82 HP @ 5,800 RPM',
      'Weight: 690 lbs',
      'Heated grips and seats',
    ],
    isDaytonaSeries: true,
    isForSale: false,
  },
  {
    id: 8,
    name: 'Off-Road Explorer 800',
    category: 'adventure',
    price: '$14,500',
    image: 'https://images.unsplash.com/photo-1666907418714-1b5f85aaf146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjBtb3RvcmN5Y2xlfGVufDF8fHx8MTc2NjY4Mzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Pure off-road capability with lightweight design and robust suspension.',
    specs: [
      'Engine: 800cc Single Cylinder',
      'Power: 75 HP @ 8,000 RPM',
      'Weight: 395 lbs',
      'Long-travel suspension',
    ],
    isDaytonaSeries: false,
    isForSale: false,
  },
];

export async function seedMotorcycles() {
  console.log('Starting to seed motorcycles database...');
  
  let successCount = 0;
  let failCount = 0;

  for (const motorcycle of initialMotorcycles) {
    const success = await saveMotorcycle(motorcycle);
    if (success) {
      successCount++;
      console.log(`✓ Saved: ${motorcycle.name}`);
    } else {
      failCount++;
      console.error(`✗ Failed to save: ${motorcycle.name}`);
    }
  }

  console.log(`\nSeeding complete: ${successCount} successful, ${failCount} failed`);
  return { successCount, failCount };
}
