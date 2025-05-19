// TEMPLATE FOR RATINGS

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

function Rating({ value, text, color }) {
    return (
        <div className="rating">
            <span>
                <FontAwesomeIcon
                    icon={value >= 1 ? faStarSolid : value >= 0.5 ? faStarHalfAlt : faStarRegular}
                    style={{ color }}
                />
            </span>

            <span>
                <FontAwesomeIcon
                    icon={value >= 2 ? faStarSolid : value >= 1.5 ? faStarHalfAlt : faStarRegular}
                    style={{ color }}
                />
            </span>

            <span>
                <FontAwesomeIcon
                    icon={value >= 3 ? faStarSolid : value >= 2.5 ? faStarHalfAlt : faStarRegular}
                    style={{ color }}
                />
            </span>

            <span>
                <FontAwesomeIcon
                    icon={value >= 4 ? faStarSolid : value >= 3.5 ? faStarHalfAlt : faStarRegular}
                    style={{ color }}
                />
            </span>

            <span>
                <FontAwesomeIcon
                    icon={value >= 5 ? faStarSolid : value >= 4.5 ? faStarHalfAlt : faStarRegular}
                    style={{ color }}
                />
            </span>

            <span>{text && text}</span>
        </div>
    );
}

export default Rating;