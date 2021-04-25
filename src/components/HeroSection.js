import React from 'react';
import '../App.css';
import {Button} from './Button';
import './HeroSection.css';

function HeroSection() {
    return (
        <div className='hero-container'>
            <h1>TEST</h1>
            <p>Test section paragraph</p>
            <div className='hero-btns'>
                <Button
                className='btns'
                buttonStyle='btn--outline'
                buttonSize='btn--large'
                >
                GET STARTED
                </Button>
                </div>
        </div>
    )
}

export default HeroSection
