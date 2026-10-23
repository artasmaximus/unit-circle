import { mount } from 'svelte';
import './app.css';
import './panel/quiz.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
