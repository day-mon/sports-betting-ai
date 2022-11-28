/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import App from './App';

import './index.css';
import {HopeProvider} from "@hope-ui/solid";

render(
  () => (
        <Router>
            <App />
        </Router>
  ),
  document.getElementById('root') as HTMLElement
);
