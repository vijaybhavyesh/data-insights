"""
DataInsight Pro - Backend Application
AI-powered analytics and data visualization platform
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from io import StringIO
import os
from datetime import datetime
import json
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from scipy import stats

# Initialize Flask app
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Global storage for uploaded dataframe (for MVP)
uploaded_data = {}

# ============= UTILITIES =============

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'csv'}

def serialize_df(df, limit=100):
    """Convert DataFrame to JSON-serializable format"""
    return df.head(limit).to_dict('records')

def NaN_to_JSON(obj):
    """Convert NaN and Inf to None for JSON serialization"""
    if isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return obj
    return obj

# ============= DATA PROCESSOR CLASS =============

class DataProcessor:
    """Handle data loading and basic processing"""
    
    @staticmethod
    def load_csv(file):
        """Load CSV file into DataFrame"""
        try:
            stream = StringIO(file.read().decode("UTF8"), newline=None)
            df = pd.read_csv(stream)
            return df, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def get_preview(df, rows=10):
        """Get data preview"""
        return df.head(rows).to_dict('records')
    
    @staticmethod
    def search_data(df, query, columns=None):
        """Search data across columns"""
        if not query:
            return df.head(50).to_dict('records')
        
        if columns is None:
            columns = df.columns.tolist()
        
        mask = False
        for col in columns:
            if col in df.columns:
                mask = mask | df[col].astype(str).str.contains(query, case=False, na=False)
        
        return df[mask].head(50).to_dict('records')
    
    @staticmethod
    def paginate_data(df, page=1, page_size=50):
        """Paginate DataFrame"""
        start = (page - 1) * page_size
        end = start + page_size
        total_pages = (len(df) + page_size - 1) // page_size
        
        return {
            'data': df.iloc[start:end].to_dict('records'),
            'page': page,
            'page_size': page_size,
            'total_rows': len(df),
            'total_pages': total_pages
        }

# ============= DATA CLEANER CLASS =============

class DataCleaner:
    """Handle data cleaning and preprocessing"""
    
    @staticmethod
    def handle_missing_values(df, strategy='drop', value=None):
        """Handle missing values"""
        df = df.copy()
        
        if strategy == 'drop':
            df = df.dropna()
        elif strategy == 'mean':
            numeric_cols = df.select_dtypes(include=['int64', 'int32', 'float64', 'float32']).columns
            for col in numeric_cols:
                if df[col].isnull().any():
                    df[col].fillna(df[col].mean(), inplace=True)
        elif strategy == 'median':
            numeric_cols = df.select_dtypes(include=['int64', 'int32', 'float64', 'float32']).columns
            for col in numeric_cols:
                if df[col].isnull().any():
                    df[col].fillna(df[col].median(), inplace=True)
        elif strategy == 'mode':
            for col in df.columns:
                if df[col].isnull().any():
                    mode_val = df[col].mode()
                    if len(mode_val) > 0:
                        df[col].fillna(mode_val[0], inplace=True)
        elif strategy == 'custom' and value is not None:
            df = df.fillna(value)
        
        return df
    
    @staticmethod
    def handle_duplicates(df, strategy='remove'):
        """Handle duplicate rows"""
        df = df.copy()
        if strategy == 'remove':
            df = df.drop_duplicates()
        return df
    
    @staticmethod
    def detect_duplicates(df):
        """Detect duplicate rows"""
        duplicates = df[df.duplicated(keep=False)].sort_values(by=list(df.columns))
        return duplicates.to_dict('records')
    
    @staticmethod
    def detect_outliers(df, method='iqr', columns=None):
        """Detect outliers"""
        if columns is None:
            columns = df.select_dtypes(include=['int64', 'int32', 'float64', 'float32']).columns
        
        outlier_indices = set()
        for col in columns:
            if col in df.columns:
                if method == 'iqr':
                    Q1 = df[col].quantile(0.25)
                    Q3 = df[col].quantile(0.75)
                    IQR = Q3 - Q1
                    lower = Q1 - 1.5 * IQR
                    upper = Q3 + 1.5 * IQR
                    outlier_indices.update(df[(df[col] < lower) | (df[col] > upper)].index)
                elif method == 'zscore':
                    z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
                    outlier_indices.update(df[z_scores > 3].index)
        
        return sorted(list(outlier_indices))
    
    @staticmethod
    def scale_data(df, method='standard', columns=None):
        """Scale numeric data"""
        df = df.copy()
        if columns is None:
            columns = df.select_dtypes(include=['int64', 'int32', 'float64', 'float32']).columns
        
        scaler = StandardScaler() if method == 'standard' else MinMaxScaler()
        df[columns] = scaler.fit_transform(df[columns])
        return df

# ============= DATA ANALYZER CLASS =============

class DataAnalyzer:
    """Analyze data and generate insights"""
    
    @staticmethod
    def get_summary_stats(df):
        """Get comprehensive summary statistics"""
        numeric_cols = df.select_dtypes(include=['int64', 'int32', 'float64', 'float32']).columns
        stats_dict = {}
        
        for col in numeric_cols:
            stats_dict[col] = {
                'mean': NaN_to_JSON(float(df[col].mean())),
                'median': NaN_to_JSON(float(df[col].median())),
                'std': NaN_to_JSON(float(df[col].std())),
                'var': NaN_to_JSON(float(df[col].var())),
                'min': NaN_to_JSON(float(df[col].min())),
                'max': NaN_to_JSON(float(df[col].max())),
                'q1': NaN_to_JSON(float(df[col].quantile(0.25))),
                'q3': NaN_to_JSON(float(df[col].quantile(0.75))),
            }
        
        return stats_dict
    
    @staticmethod
    def get_correlations(df):
        """Calculate correlations"""
        numeric_df = df.select_dtypes(include=['int64', 'int32', 'float64', 'float32'])
        if len(numeric_df.columns) < 2:
            return []
        
        corr_matrix = numeric_df.corr()
        correlations = []
        
        for i, col1 in enumerate(corr_matrix.columns):
            for j, col2 in enumerate(corr_matrix.columns):
                if i < j:
                    correlations.append({
                        'column1': col1,
                        'column2': col2,
                        'correlation': NaN_to_JSON(float(corr_matrix.loc[col1, col2]))
                    })
        
        return sorted(correlations, key=lambda x: abs(x['correlation']), reverse=True)
    
    @staticmethod
    def get_value_counts(df, column, top_n=10):
        """Get value counts"""
        counts = df[column].value_counts().head(top_n).to_dict()
        return {k: int(v) for k, v in counts.items()}
    
    @staticmethod
    def detect_anomalies(df, column, method='iqr'):
        """Detect anomalies"""
        if not pd.api.types.is_numeric_dtype(df[column]):
            return []
        
        data = df[column].dropna()
        if method == 'iqr':
            Q1 = data.quantile(0.25)
            Q3 = data.quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            anomalies = df[(df[column] < lower) | (df[column] > upper)][column].tolist()
        
        return [NaN_to_JSON(x) for x in anomalies]

# ============= INSIGHT GENERATOR CLASS =============

class InsightGenerator:
    """Generate AI-powered insights"""
    
    @staticmethod
    def generate_insights(df):
        """Generate insights from data"""
        insights = []
        
        # Basic overview
        insights.append({
            'type': 'overview',
            'text': f'Dataset contains {len(df)} rows and {len(df.columns)} columns',
            'severity': 'info'
        })
        
        # Missing data
        missing_total = df.isna().sum().sum()
        if missing_total > 0:
            missing_pct = (missing_total / (len(df) * len(df.columns))) * 100
            insights.append({
                'type': 'quality',
                'text': f'Dataset has {missing_pct:.1f}% missing values',
                'severity': 'warning' if missing_pct > 10 else 'info'
            })
        
        # Duplicates
        duplicates = len(df[df.duplicated()])
        if duplicates > 0:
            dup_pct = (duplicates / len(df)) * 100
            insights.append({
                'type': 'quality',
                'text': f'Found {duplicates} duplicate rows ({dup_pct:.1f}%)',
                'severity': 'warning'
            })
        
        # Numeric column analysis
        numeric_cols = df.select_dtypes(include=['int64', 'int32', 'float64', 'float32']).columns
        for col in numeric_cols[:3]:
            skewness = df[col].skew()
            if abs(skewness) > 1:
                direction = 'right' if skewness > 0 else 'left'
                insights.append({
                    'type': 'distribution',
                    'text': f'Column "{col}" shows {direction}-skewed distribution',
                    'severity': 'info'
                })
        
        # Correlations
        numeric_df = df.select_dtypes(include=['int64', 'int32', 'float64', 'float32'])
        if len(numeric_df.columns) >= 2:
            corr_matrix = numeric_df.corr()
            for i, col1 in enumerate(corr_matrix.columns):
                for j, col2 in enumerate(corr_matrix.columns):
                    if i < j and abs(corr_matrix.loc[col1, col2]) > 0.7:
                        insights.append({
                            'type': 'correlation',
                            'text': f'Strong correlation between "{col1}" and "{col2}" ({abs(corr_matrix.loc[col1, col2]):.2f})',
                            'severity': 'info'
                        })
        
        return insights[:10]  # Limit to 10 insights

# ============= API ROUTES =============

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only CSV files are allowed'}), 400
        
        # Load DataFrame
        df, error = DataProcessor.load_csv(file)
        if error:
            return jsonify({'error': f'Error reading file: {error}'}), 400
        
        if df.empty:
            return jsonify({'error': 'File is empty'}), 400
        
        # Store in memory
        session_id = datetime.now().strftime('%Y%m%d%H%M%S')
        uploaded_data[session_id] = df
        
        # Return response
        return jsonify({
            'success': True,
            'session_id': session_id,
            'file_name': file.filename,
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': df.columns.tolist(),
            'preview': DataProcessor.get_preview(df, 5),
            'summary': {
                'total_rows': len(df),
                'total_columns': len(df.columns),
                'duplicate_rows': len(df[df.duplicated()]),
                'missing_values': int(df.isna().sum().sum()),
                'numeric_columns': len(df.select_dtypes(include=['int64', 'int32', 'float64', 'float32']).columns),
                'categorical_columns': len(df.select_dtypes(include=['object', 'category']).columns)
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/<session_id>/preview', methods=['GET'])
def get_preview(session_id):
    """Get data preview with pagination"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        df = uploaded_data[session_id]
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 50, type=int)
        
        result = DataProcessor.paginate_data(df, page, page_size)
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/<session_id>/search', methods=['POST'])
def search_data(session_id):
    """Search data"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        df = uploaded_data[session_id]
        query = request.json.get('query', '')
        columns = request.json.get('columns', None)
        
        results = DataProcessor.search_data(df, query, columns)
        return jsonify({'results': results, 'count': len(results)}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/<session_id>/summary', methods=['GET'])
def get_summary(session_id):
    """Get data summary and statistics"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        df = uploaded_data[session_id]
        
        # Basic summary
        summary = {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'columns': df.columns.tolist(),
            'duplicate_rows': len(df[df.duplicated()]),
            'missing_values': int(df.isna().sum().sum()),
            'memory_usage': str(df.memory_usage(deep=True).sum() / 1024**2)[:5] + ' MB',
            'numeric_columns': len(df.select_dtypes(include=['int64', 'int32', 'float64', 'float32']).columns),
            'categorical_columns': len(df.select_dtypes(include=['object', 'category']).columns),
            'column_info': []
        }
        
        # Column details
        for col in df.columns:
            col_type = str(df[col].dtype)
            summary['column_info'].append({
                'name': col,
                'type': col_type,
                'non_null_count': int(df[col].notna().sum()),
                'null_count': int(df[col].isna().sum()),
                'unique_count': int(df[col].nunique()),
                'null_percentage': round((df[col].isna().sum() / len(df)) * 100, 2)
            })
        
        # Statistics for numeric columns
        summary['statistics'] = DataAnalyzer.get_summary_stats(df)
        
        return jsonify(summary), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/<session_id>/correlations', methods=['GET'])
def get_correlations(session_id):
    """Get correlation matrix"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        df = uploaded_data[session_id]
        correlations = DataAnalyzer.get_correlations(df)
        
        return jsonify({'correlations': correlations}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/<session_id>/chart-data', methods=['POST'])
def get_chart_data(session_id):
    """Generate chart data"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        df = uploaded_data[session_id]
        data = request.json
        
        chart_type = data.get('chart_type', 'bar')
        x_axis = data.get('x_axis')
        y_axis = data.get('y_axis')
        
        if not x_axis or not y_axis:
            return jsonify({'error': 'x_axis and y_axis are required'}), 400
        
        if x_axis not in df.columns or y_axis not in df.columns:
            return jsonify({'error': 'Invalid column names'}), 400
        
        # Professional color palette - Single shade variations
        primary_color = 'rgba(0, 217, 255, 0.85)'      # Main cyan
        primary_border = 'rgb(0, 217, 255)'             # Bright cyan
        primary_hover = 'rgba(0, 217, 255, 1)'          # Full opacity cyan
        
        # For pie/doughnut - use cyan shades
        pie_colors = [
            'rgba(0, 217, 255, 0.9)',
            'rgba(0, 180, 220, 0.9)',
            'rgba(0, 150, 200, 0.9)',
            'rgba(0, 120, 180, 0.9)',
            'rgba(0, 100, 150, 0.9)',
        ]
        
        pie_borders = [
            'rgb(0, 217, 255)',
            'rgb(0, 180, 220)',
            'rgb(0, 150, 200)',
            'rgb(0, 120, 180)',
            'rgb(0, 100, 150)',
        ]
        
        # Group data
        if chart_type in ['bar', 'pie', 'doughnut']:
            grouped = df.groupby(x_axis)[y_axis].sum().reset_index()
            datasets = []
            
            # For bar charts, use single professional color
            if chart_type == 'bar':
                datasets.append({
                    'label': y_axis,
                    'data': grouped[y_axis].astype(float).tolist(),
                    'backgroundColor': primary_color,
                    'borderColor': primary_border,
                    'borderWidth': 2,
                    'borderRadius': 6,
                    'hoverBackgroundColor': primary_hover,
                })
            else:
                # For pie/doughnut - use cyan shades
                num_items = len(grouped)
                datasets.append({
                    'label': y_axis,
                    'data': grouped[y_axis].astype(float).tolist(),
                    'backgroundColor': (pie_colors * ((num_items // len(pie_colors)) + 1))[:num_items],
                    'borderColor': (pie_borders * ((num_items // len(pie_borders)) + 1))[:num_items],
                    'borderWidth': 2,
                })
            
            chart_data = {
                'labels': grouped[x_axis].astype(str).tolist(),
                'datasets': datasets
            }
        else:  # line, scatter, area
            # For scatter and area, data should be numeric x,y pairs
            if chart_type == 'scatter':
                # Scatter needs {x, y} format - filter out NaN values
                scatter_data = []
                for i in range(len(df)):
                    try:
                        x_val = float(df[x_axis].iloc[i])
                        y_val = float(df[y_axis].iloc[i])
                        # Skip NaN or infinite values
                        if pd.notna(x_val) and pd.notna(y_val) and not (pd.isna(x_val) or pd.isna(y_val)):
                            scatter_data.append({
                                'x': x_val,
                                'y': y_val
                            })
                    except (ValueError, TypeError):
                        continue
                
                # Ensure we have data
                if not scatter_data:
                    return jsonify({'error': 'No valid numeric data for scatter chart. Ensure both X and Y axes contain numeric values.'}), 400
                
                datasets = [{
                    'label': f'{y_axis} vs {x_axis}',
                    'data': scatter_data,
                    'borderColor': 'rgb(0, 217, 255)',
                    'backgroundColor': 'rgba(0, 217, 255, 0.7)',
                    'pointRadius': 6,
                    'pointHoverRadius': 8,
                }]
                
                chart_data = {
                    'datasets': datasets
                }
            else:
                # Line and area charts use labels with data
                datasets = [{
                    'label': y_axis,
                    'data': df[y_axis].astype(float).tolist(),
                    'borderColor': 'rgb(0, 217, 255)',
                    'backgroundColor': 'rgba(0, 217, 255, 0.1)' if chart_type == 'area' else 'transparent',
                    'borderWidth': 3,
                    'fill': chart_type == 'area',
                    'tension': 0,  # Straight lines, not curved
                    'pointBackgroundColor': 'rgba(0, 217, 255, 0.8)',
                    'pointBorderColor': 'rgb(0, 217, 255)',
                    'pointBorderWidth': 2,
                    'pointRadius': 5,
                    'pointHoverRadius': 7,
                }]
                
                chart_data = {
                    'labels': df[x_axis].astype(str).tolist(),
                    'datasets': datasets
                }
        
        return jsonify(chart_data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/<session_id>/value-counts', methods=['POST'])
def get_value_counts(session_id):
    """Get value counts for categorical column"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        df = uploaded_data[session_id]
        column = request.json.get('column')
        top_n = request.json.get('top_n', 10)
        
        if column not in df.columns:
            return jsonify({'error': 'Column not found'}), 404
        
        counts = DataAnalyzer.get_value_counts(df, column, top_n)
        
        return jsonify({
            'labels': list(counts.keys()),
            'data': list(counts.values())
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/clean/<session_id>/missing-values', methods=['POST'])
def handle_missing(session_id):
    """Handle missing values"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        strategy = request.json.get('strategy', 'drop')
        value = request.json.get('value')
        
        df = uploaded_data[session_id]
        df_cleaned = DataCleaner.handle_missing_values(df, strategy, value)
        
        # Store cleaned data
        session_id_cleaned = session_id + '_cleaned'
        uploaded_data[session_id_cleaned] = df_cleaned
        
        return jsonify({
            'success': True,
            'session_id': session_id_cleaned,
            'rows_before': len(df),
            'rows_after': len(df_cleaned),
            'preview': DataProcessor.get_preview(df_cleaned, 5)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/clean/<session_id>/duplicates', methods=['POST'])
def handle_duplicates(session_id):
    """Handle duplicates"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        strategy = request.json.get('strategy', 'remove')
        df = uploaded_data[session_id]
        df_cleaned = DataCleaner.handle_duplicates(df, strategy)
        
        session_id_cleaned = session_id + '_dedup'
        uploaded_data[session_id_cleaned] = df_cleaned
        
        return jsonify({
            'success': True,
            'session_id': session_id_cleaned,
            'rows_before': len(df),
            'rows_after': len(df_cleaned),
            'duplicates_removed': len(df) - len(df_cleaned),
            'preview': DataProcessor.get_preview(df_cleaned, 5)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/insights/<session_id>', methods=['GET'])
def get_insights(session_id):
    """Get AI-powered insights"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        df = uploaded_data[session_id]
        insights = InsightGenerator.generate_insights(df)
        
        return jsonify({'insights': insights}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/insights/<session_id>/correlation', methods=['GET'])
def get_correlation_matrix(session_id):
    """Get correlation matrix for numeric columns"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        df = uploaded_data[session_id]
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(numeric_cols) < 2:
            return jsonify({'error': 'Need at least 2 numeric columns'}), 400
        
        # Calculate correlation matrix
        corr_matrix = df[numeric_cols].corr().fillna(0)
        
        # Find strongest correlations
        strong_correlations = []
        for i in range(len(numeric_cols)):
            for j in range(i+1, len(numeric_cols)):
                corr_value = corr_matrix.iloc[i, j]
                if abs(corr_value) > 0.5:
                    strong_correlations.append({
                        'col1': numeric_cols[i],
                        'col2': numeric_cols[j],
                        'correlation': float(corr_value)
                    })
        
        # Sort by absolute correlation
        strong_correlations.sort(key=lambda x: abs(x['correlation']), reverse=True)
        
        return jsonify({
            'matrix': corr_matrix.to_dict(),
            'columns': numeric_cols,
            'strong_correlations': strong_correlations[:10],
            'heatmap_data': [{
                'x': i,
                'y': j,
                'value': float(corr_matrix.iloc[i, j])
            } for i in range(len(numeric_cols)) for j in range(len(numeric_cols))]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/<session_id>/csv', methods=['GET'])
def export_csv(session_id):
    """Export data as CSV"""
    try:
        if session_id not in uploaded_data:
            return jsonify({'error': 'Session not found'}), 404
        
        df = uploaded_data[session_id]
        csv_data = df.to_csv(index=False)
        
        return csv_data, 200, {'Content-Disposition': f'attachment; filename=data_{session_id}.csv'}
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= ERROR HANDLERS =============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ============= MAIN =============

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
