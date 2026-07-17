# CityWheels Manager Dashboard

A comprehensive delivery management platform built with Next.js, featuring real-time analytics, fleet tracking, and business intelligence tools.

## 🚀 Features

### 📊 Advanced Analytics Dashboard
- Real-time business metrics and KPIs
- Interactive charts with Chart.js integration
- Revenue trends and growth analytics
- Rider performance tracking
- Hourly and daily breakdowns

### 🗺️ Live Fleet Tracking
- Real-time rider location monitoring
- Interactive map interface
- Rider availability status
- Performance metrics per rider
- Fleet utilization analytics

### 💰 Financial Management
- Comprehensive earnings reports
- Automated payout calculations (85% rider, 15% platform)
- Weekly payout summaries
- Revenue by package type analysis
- Growth metrics and comparisons

### 🔔 Smart Business Alerts
- Low rider availability warnings
- High cancellation rate alerts
- Revenue monitoring notifications
- Real-time business intelligence

### 👥 Rider Management
- Complete rider onboarding system
- Performance tracking and ratings
- Delivery history and statistics
- Real-time status monitoring

### 📱 Responsive Design
- Mobile-first responsive layout
- Collapsible sidebar navigation
- Touch-optimized interface
- Professional loading states

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, React-Chartjs-2
- **State Management**: React Query (TanStack Query)
- **Forms**: Formik + Yup validation
- **API**: RESTful API integration
- **Authentication**: JWT-based auth system

## 📁 Project Structure

```
rider-manager/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Manager dashboard pages
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── tracking/      # Live fleet tracking
│   │   ├── riders/        # Rider management
│   │   ├── deliveries/    # Delivery monitoring
│   │   └── earnings/      # Financial reports
│   ├── features/          # Features marketing page
│   ├── how-it-works/      # Process explanation page
│   ├── pricing/           # Pricing information page
│   ├── login/             # Manager authentication
│   └── signup/            # Manager registration
├── components/            # Reusable UI components
│   ├── DashboardLayout.tsx # Main dashboard layout
│   ├── Navigation.tsx     # Site navigation
│   ├── Footer.tsx         # Site footer
│   ├── LoadingSpinner.tsx # Loading states
│   └── SkeletonLoader.tsx # Skeleton loading
├── lib/                   # Utilities and configurations
│   ├── api.ts            # API client
│   ├── hooks.ts          # React Query hooks
│   └── validations.ts    # Form validation schemas
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Backend API running (see city-wheel-backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd city-wheels/rider-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update the API URL in your environment file.

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Dashboard Features

### Main Dashboard
- Company overview with key metrics
- Business alerts and notifications
- Quick action buttons
- Recent deliveries table

### Analytics Dashboard
- Real-time charts and graphs
- KPI cards with growth indicators
- Performance insights
- Customizable time periods

### Live Tracking
- Interactive map with rider locations
- Real-time status updates
- Rider performance details
- Fleet availability overview

### Financial Reports
- Revenue analytics with trends
- Payout management system
- Detailed financial breakdowns
- Growth metrics and comparisons

## 🎨 Design System

- **Primary Color**: Green (#059669)
- **Secondary Colors**: Blue, Purple, Yellow
- **Typography**: System fonts with clear hierarchy
- **Components**: Consistent design patterns
- **Responsive**: Mobile-first approach

## 🔐 Authentication

- JWT-based authentication system
- Manager registration and login
- Company setup workflow
- Protected dashboard routes
- Automatic token management

## 📱 Responsive Features

- **Desktop**: Full sidebar navigation
- **Mobile**: Collapsible hamburger menu
- **Tablet**: Optimized layouts
- **Touch**: Touch-friendly interactions

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t citywheels-manager .
docker run -p 3000:3000 citywheels-manager
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Performance

- **Loading States**: Skeleton loaders and spinners
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Caching**: React Query for efficient data fetching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for modern delivery management**
