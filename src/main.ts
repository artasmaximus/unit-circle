import { mount } from 'svelte';
import './theme.css';
import './app.css';
import './practice/practice.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
