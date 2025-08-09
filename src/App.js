// Import necessary React hooks and Material-UI components
import React, { useState, useEffect } from 'react';
  // useState: A React hook that lets me add state to functional components
  // useEffect: A React hook for performing side effects (like data fetching)
import { 
  Button, // Interactive Clickable Buttons
  Card,   // Container for Displaying Content
  CardContent, // Wrapper for Card Content
  CardMedia,  // For Displaying Media (IMG) in Cards
  Typography, // For Properly Styled Text
  Container, // Centers Content and sets Max Width
  AppBar,   // Top Navigation Bar
  Toolbar, // Container for AppBar content
  CircularProgress, // Loading Spinner
  Alert, // To display Error Messages
  Chip, // Small Interactive Elements (used for temperaments)
  Stack // Layout component for arranging items
} from '@mui/material';

// Store API key (in production, use environment variables)
const API_KEY = process.env.REACT_APP_DOG_API_KEY;

// root component of application
function App() { // These are variables that hold data and trigger UI updates when changed
   
  // Track which screen to show ('home' or 'dogPicker') - useState returns the current State and a function to update it
  const [currentScreen, setCurrentScreen] = useState('home');
  
  // Store the list of dog breeds from API, intialized as an empty array
  const [dogData, setDogData] = useState([]);

  // Track which dog is currently being viewed (array index)
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  
  // Boolean to track if data is loaded (if true show spinner)
  const [loading, setLoading] = useState(false);
 
  // Store error messages if API call fails
  const [error, setError] = useState(null);

 // ========== API FETCH FUNCTION ==========
  // This gets dog data from The Dog API
  const fetchDogData = async () => {
    setLoading(true); // Show loading spinner
    setError(null); // Clear any previous errors
    try {
      // Make GET request to The Dog API
      const response = await fetch('https://api.thedogapi.com/v1/breeds', {
        headers: {
          'x-api-key': API_KEY 
        }
      });
      // Check if request failed
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      

      // Parse JSON response
      const data = await response.json();
     
     
      // Transform API data into our preferred format
      const formattedData = data

      // Only include dogs with images Filters out dogs without images using optional chaining (?.)

        .filter(dog => dog.image?.url) 

        // Map each dog to a simpler structure
      .map(dog => {
      // Helper function to safely extract life span numbers
        const getLifeSpanNumbers = (lifeSpan) => {
       if (!lifeSpan) return { min: 'Unknown', max: 'Unknown' };
    
         const parts = lifeSpan.split(' - ');
         const min = parts[0]?.replace(/\D/g, '') || 'Unknown';
         const max = parts[1]?.replace(/\D/g, '') || min;
    
    return { min, max };
  };

  // Helper function to safely extract height/weight ranges
  const getRange = (metric) => {
    if (!metric) return { min: 'Unknown', max: 'Unknown' };
    
    const parts = metric.split(' - ');
    const min = parts[0] || 'Unknown';
    const max = parts[1] || min;
    
    return { min, max };
  };

  const lifeSpan = getLifeSpanNumbers(dog.life_span);
  const height = getRange(dog.height?.metric);
  const weight = dog.weight?.metric || 'Unknown';

  return {
    id: dog.id,
    Name: dog.name,
    "Breed Group": dog.breed_group || 'Unknown',
    "Bred For": dog.bred_for || 'Unknown',
    "Minimum Life Span": lifeSpan.min,
    "Maximum Life Span": lifeSpan.max,
    "Minimum Height": height.min,
    "Maximum Height": height.max,
    "Temperament": dog.temperament || 'Unknown',
    "Image": dog.image?.url,
    "Weight": weight,
    "Origin": dog.origin || 'Unknown'
  };
})

      // Save the transformed data to state
      setDogData(formattedData);
    } catch (err) {
      console.error('Error fetching dog data:', err);
      setError('Failed to load dog data. Please try again later.');
    } finally {
      setLoading(false);  // Hide loading spinner
    }
  };


   // ========== NAVIGATION FUNCTIONS ==========

   // Reset to first dog
  const firstScreen = () => {
    setCurrentDogIndex(0);
  };

  // Load initial data when component mounts or screen changes
  useEffect(() => {
    if (currentScreen === 'dogPicker' && dogData.length === 0) {
      fetchDogData();
    }
  }, [currentScreen]);

  // Go to next dog
  const handleNext = () => {
    if (currentDogIndex < dogData.length - 1) {
      setCurrentDogIndex(currentDogIndex + 1);
    }
  };
  // Go to previous dog
  const handlePrev = () => {
    if (currentDogIndex > 0) {
      setCurrentDogIndex(currentDogIndex - 1);
    }
  };
// Display temperament as clickable chips (tags)
  const renderTemperament = () => {
    if (!dogData[currentDogIndex]?.Temperament) return 'Unknown';
     // Split temperament string into array
    const temperaments = dogData[currentDogIndex].Temperament.split(', ');
    return (
      // Stack chips horizontally with spacing
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {temperaments.map((temp, index) => (
          <Chip key={index} label={temp} size="small" />
        ))}
      </Stack>
    );
  };

    // ========== COMPONENT RENDERING ==========


  return (
    <div className="App">
            {/* Navigation Bar at top */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Dog Breed App</Typography>
        </Toolbar>
      </AppBar>
      {/* Main content container */}
      <Container maxWidth="md" style={{ marginTop: '20px' }}>
         {/* Conditional rendering based on current screen */}
        {currentScreen === 'home' ? (
                    // ===== HOME SCREEN =====
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Typography variant="h4" gutterBottom>Welcome to Dog Breed Info</Typography>
            <Typography variant="body1" paragraph>
              Explore detailed information about various dog breeds from The Dog API.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setCurrentScreen('dogPicker')}
              style={{ marginTop: '20px' }}
            >
              Start Exploring
            </Button>
          </div>
        ) : (
                    // ===== DOG PICKER SCREEN =====
          <div>
            {/* Loading state */}
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <CircularProgress />
              </div>
            ) :
            /* Error state */
             error ? (
              <Alert severity="error" style={{ margin: '20px 0' }}>
                {error}
              </Alert>
            ) :
            /* Success state - show dog card */
             dogData.length > 0 && currentDogIndex < dogData.length ? (
              <Card>
                <CardMedia
                  component="img"
                  height="400"
                  image={dogData[currentDogIndex].Image}
                  alt={dogData[currentDogIndex].Name}
                  style={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h4" component="div">
                    {dogData[currentDogIndex].Name}
                  </Typography>
                  
                  {dogData[currentDogIndex].Origin && (
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Origin: {dogData[currentDogIndex].Origin}
                    </Typography>
                  )}
                  
                  <Typography variant="body1" paragraph>
                    <strong>Breed Group:</strong> {dogData[currentDogIndex]["Breed Group"]}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    <strong>Bred For:</strong> {dogData[currentDogIndex]["Bred For"]}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    <strong>Life Span:</strong> {dogData[currentDogIndex]["Minimum Life Span"]} - {dogData[currentDogIndex]["Maximum Life Span"]} years
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    <strong>Height:</strong> {dogData[currentDogIndex]["Minimum Height"]} - {dogData[currentDogIndex]["Maximum Height"]} cm
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    <strong>Weight:</strong> {dogData[currentDogIndex].Weight} kg
                  </Typography>
                  
                  <Typography variant="body1" gutterBottom>
                    <strong>Temperament:</strong>
                  </Typography>
                  {renderTemperament()}
                </CardContent>
              </Card>
            ) : (
              <Typography>No dog data available</Typography>
            )}
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => setCurrentScreen('home')}
              >
                Back to Home
              </Button>
              
              <Typography variant="body2" color="text.secondary">
                Breed {currentDogIndex + 1} of {dogData.length}
              </Typography>
              
              <div>
                <Button 
                  variant="contained" 
                  onClick={handlePrev}
                  disabled={currentDogIndex === 0 || loading}
                  style={{ marginRight: '10px' }}
                >
                  Previous
                </Button>
                <Button 
                  variant="contained" 
                  onClick={firstScreen}
                  disabled={currentDogIndex === 0 || loading}
                  style={{ marginRight: '10px' }}
                >
                  First
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  disabled={currentDogIndex === dogData.length - 1 || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );s
}

export default App;