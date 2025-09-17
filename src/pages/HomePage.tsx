import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <header>
        <h1>Welcome to the Turing Machine Simulator</h1>
      </header>
      <main>
        <p>
          This application was created because I, Omar Solieman, wanted to provide a modern and user-friendly Turing Machine simulator. The existing simulators felt outdated, and I wanted to create something better for enthusiasts and learners alike.
        </p>
        <p>
          Explore the features, try out the examples, and see how Turing Machines work in a visually intuitive way.
        </p>
      </main>
      <footer>
        <p>Made by Omar Solieman</p>
        <p>
          <a href="https://github.com/omarsolieman" target="_blank" rel="noopener noreferrer">
            GitHub: omarsolieman
          </a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;