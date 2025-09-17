import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Play, Github, ExternalLink } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartSimulator = () => {
    navigate('/simulator');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Turing Machine Simulator
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            A modern, interactive Turing machine simulator built with React, TypeScript, and Tailwind CSS.
            Explore the fundamentals of computation with a sleek and intuitive interface.
          </p>
        </div>

        {/* Main Action Button */}
        <div className="text-center mb-20">
          <Button size="lg" onClick={handleStartSimulator} className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Play className="mr-3 h-6 w-6" />
            Launch Simulator
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Visual Editor</CardTitle>
              <CardDescription>Design machines with a drag-and-drop interface.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Execution</CardTitle>
              <CardDescription>Watch the machine work in real-time or step-by-step.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Example Library</CardTitle>
              <CardDescription>Load pre-built machines for common algorithms.</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Detailed Cards Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Interactive Tape</CardTitle>
              <CardDescription>See the tape update live and edit it on the fly.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-4 h-full flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">Tape visualization placeholder</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>State & Transition Management</CardTitle>
              <CardDescription>Easily define states, alphabets, and transition rules.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-4 h-full flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">State editor placeholder</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action / Links */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Get Involved</h2>
          <div className="flex justify-center gap-4">
            <a href="https://github.com/omarsolieman/play-turing-machine" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </a>
            <a href="https://en.wikipedia.org/wiki/Turing_machine" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                Learn More
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;