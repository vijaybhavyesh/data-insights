# DataInsight Pro - AI-Powered Analytics Dashboard

A professional, production-ready analytics platform for data analysis, visualization, and insights generation.

## Features

✨ **Core Features**
- 📤 CSV file upload with drag-and-drop
- 👀 Interactive data preview with search and pagination
- 📊 Dynamic multi-chart visualizations (Bar, Line, Pie, Scatter, Area, etc.)
- 🧹 Advanced data cleaning and preprocessing
- 🤖 AI-powered insights and anomaly detection
- 📥 Export data and charts as CSV/PNG
- 🎨 Premium dark theme with glassmorphism UI
- 📱 Fully responsive design

## Tech Stack

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Chart.js + react-chartjs-2
- Lucide Icons
- React Hot Toast

**Backend:**
- Flask 3
- Pandas 2
- NumPy
- Scikit-learn
- Python 3.8+

## Project Structure

```
DataInsightPro/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── uploads/            # Temporary file storage
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # Entry point
│   │   └── styles/
│   │       └── globals.css # TailwindCSS + custom styles
│   ├── index.html          # HTML template
│   ├── package.json        # Node dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind configuration
│   └── postcss.config.js   # PostCSS configuration
│
└── README.md               # This file
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Access the Application

Open your browser and navigate to `http://localhost:5173`

## Usage

### 1. Upload Dataset
- Drag and drop a CSV file or click to browse
- File size limit: 50MB
- Automatic preview and statistics generation

### 2. View Dashboard
- See data summary statistics
- Preview dataset with search and pagination
- Column information and type details

### 3. Create Visualizations
- Select chart type (Bar, Line, Pie, etc.)
- Choose X and Y axes
- Generate interactive charts
- Export charts as PNG

### 4. Clean & Preprocess Data
- Handle missing values (drop, mean, median, mode)
- Remove duplicate rows
- Detect and manage outliers
- Scale numerical data

### 5. Generate Insights
- AI-powered data analysis
- Anomaly detection
- Correlation detection
- Distribution analysis

### 6. Export Data
- Download cleaned datasets as CSV
- Export charts as PNG images

## API Endpoints

### Upload & Data Management
- `POST /api/upload` - Upload CSV file
- `GET /api/data/<session_id>/preview` - Get paginated data preview
- `POST /api/data/<session_id>/search` - Search data
- `GET /api/data/<session_id>/summary` - Get data summary

### Analytics
- `GET /api/data/<session_id>/correlations` - Get correlation matrix
- `POST /api/data/<session_id>/chart-data` - Generate chart data
- `POST /api/data/<session_id>/value-counts` - Get value counts

### Data Cleaning
- `POST /api/clean/<session_id>/missing-values` - Handle missing values
- `POST /api/clean/<session_id>/duplicates` - Remove duplicates

### Insights & Export
- `GET /api/insights/<session_id>` - Generate AI insights
- `GET /api/export/<session_id>/csv` - Export as CSV

## UI/UX Features

### Design System
- **Color Palette**: Dark theme with neon cyan/purple accents
- **Typography**: Inter font family
- **Components**: Glass-morphism cards with subtle blur effects
- **Animations**: Smooth transitions and fade-in effects
- **Responsiveness**: Mobile, tablet, and desktop optimized

### Dark Mode
- Default dark theme throughout
- Optimized for extended viewing
- Reduced eye strain
- Modern aesthetic

### Premium Feel
- Glassmorphism UI components
- Gradient accents
- Smooth hover effects
- Professional color schemes

## Performance Optimization

- Lazy loading of components
- Efficient data pagination
- Client-side filtering and sorting
- Memoized chart rendering
- Optimized API calls
- CSS-in-JS for minimal bundle size

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Limitations

Current MVP limitations:
- In-memory data storage (data lost on server restart)
- Single user session
- No authentication
- Maximum 50MB file size

## Future Enhancements

- [ ] Database integration
- [ ] User authentication
- [ ] Persistent data storage
- [ ] Multi-user collaboration
- [ ] Advanced ML models
- [ ] Real-time data streaming
- [ ] Custom dashboards
- [ ] Scheduled reports
- [ ] Integration with data sources (SQL, APIs)

## Troubleshooting

### Port Already in Use
```bash
# Backend (change port in app.py)
python app.py --port 5001

# Frontend (Vite will auto-select another port)
npm run dev
```

### CORS Issues
- Ensure backend CORS is enabled in `app.py`
- Check frontend API URL matches backend address

### Large File Upload Errors
- Increase `MAX_CONTENT_LENGTH` in Flask config
- Check available disk space

## Development

### Adding New Visualizations
Edit the `ChartContainer` component to add new chart types from Chart.js.

### Adding New Data Processors
Create new methods in the `DataProcessor` class in `app.py`.

### Customizing Styling
- Modify `tailwind.config.js` for colors and themes
- Update `globals.css` for component styles

## License

MIT License - Feel free to use for personal and commercial projects.

## Support

For issues, suggestions, or contributions, please create an issue or submit a pull request.

---

**DataInsight Pro** - Making data analysis accessible, beautiful, and intelligent. 🚀
