
<img src="https://github.com/user-attachments/assets/b928b858-b5f4-491b-a0dd-16de440b8fa4" alt="App Screenshot" width="300"/>

 # Third Places – A Mobile Social Discovery App

This project involves the creation of a React Native mobile application that helps users discover and share "third places" – social environments beyond home and work where people gather and build community. It represents a comprehensive exploration into mobile app development, geolocation services, and social networking features.

## Core Technologies

- **React Native:** Cross-platform mobile development framework enabling iOS and Android compatibility with a single codebase.

- **Expo:** Development platform that simplifies React Native development with pre-built components, over-the-air updates, and streamlined deployment.

- **Supabase:** Backend-as-a-Service providing real-time database, authentication, and storage capabilities for seamless data management.

- **Google Places API:** Location services integration for place search, geocoding, and mapping functionality.

- **Redux Toolkit:** State management solution for predictable application state handling and data flow.

## Key Features

* **Interactive Map View:** Real-time map interface displaying third places with custom markers and location-based filtering.
* **List View:** Alternative browsing experience with categorized place listings and search functionality.
* **Place Discovery:** Users can search for and add new third places with category classification and descriptions.
* **Category Filtering:** Five distinct categories (Food, Nightlife, Outdoors, Workspace, Discover) with color-coded organization.
* **Location Services:** GPS integration for user location detection and nearby place recommendations.
* **Social Sharing:** Community-driven platform where users contribute to a shared database of third places.

---

## Technical Architecture

### Navigation Structure
* **Bottom Tab Navigation:** Three main sections (Home, Add, Profile) with custom styled tab bar
* **Stack Navigation:** Nested navigation for home screen with map/list toggle and new post creation
* **Modal Screens:** Seamless transitions between different app views and functionalities

### State Management
* **Redux Store:** Centralized state management for user data, place information, and app preferences
* **Async Storage:** Local data persistence for user sessions and cached information
* **Real-time Updates:** Supabase integration for live data synchronization across users

### UI/UX Design
* **Custom Fonts:** Fredoka font family integration for consistent typography
* **Blur Effects:** Modern glassmorphism design with expo-blur components
* **Responsive Layout:** Adaptive design that works across different screen sizes and orientations
* **Smooth Animations:** Transition animations and interactive feedback for enhanced user experience

---

## Reflection

### Design Considerations
* **Accessibility:** Focus on inclusive design with proper contrast ratios and touch target sizes
* **Performance:** Optimized rendering with React Native best practices and efficient state management
* **Scalability:** Modular component architecture allowing for easy feature additions and maintenance
* **User Experience:** Intuitive navigation flow and clear visual hierarchy for seamless interaction

### Strengths:
- **Cross-Platform Compatibility:** Single codebase deployment for both iOS and Android platforms
- **Real-time Functionality:** Live data updates and collaborative features enhance community engagement
- **Modern UI Design:** Contemporary design language with smooth animations and intuitive interactions
- **Robust Backend Integration:** Reliable data persistence and synchronization through Supabase

### Weaknesses:
- **API Dependencies:** Reliance on external services (Google Places, Supabase) for core functionality
- **Offline Limitations:** Limited functionality when network connectivity is unavailable
- **Platform Constraints:** Some features may behave differently across iOS and Android due to platform-specific implementations

### Technical Challenges Overcome:
- **Geolocation Integration:** Successfully implemented location services with proper permission handling
- **State Synchronization:** Managed complex state updates between local storage and cloud database
- **Performance Optimization:** Balanced feature richness with app performance and battery efficiency
- **Navigation Complexity:** Designed intuitive navigation flow while maintaining code maintainability

### Conclusion
The Third Places mobile application successfully demonstrates the potential of React Native for creating engaging, community-driven platforms. Through the integration of modern mobile development practices, geolocation services, and real-time data management, the project showcases how technology can facilitate social connections and community building. The app stands as a testament to the power of mobile applications in fostering meaningful human interactions and discovering shared spaces that enrich our social lives. 
