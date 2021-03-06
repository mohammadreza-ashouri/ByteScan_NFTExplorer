import React from 'react';
import { Link } from 'react-router-dom';
import { AttributesType } from 'types';

import classes from './ArtBoard.module.scss';

type PropsType = {
  attr: {
    attributes: AttributesType;
    id: string;
  };
};

const ArtBoard: React.FC<PropsType> = ({ attr }) => {
  const { items = [], name } = attr.attributes;
  return (
    <Link
      to={`/artboard/${attr.id}`}
      onClick={(e) => {
        if (items.length === 0) {
          e.preventDefault();
        }
      }}
      className={classes.artBoard}
    >
      <div className={classes.imageWrapper}>
        {items.slice(0, 3).map((i, index) => (
          <div className={classes.image} key={index}>
            {/* @ts-ignore */}
            <img src={i?.meta?.image?.url?.PREVIEW} alt={i} />
          </div>
        ))}
      </div>
      <div className={classes.name}>{name}</div>
      {/* <TelegramShareButton title={name} url={`https://localhost:8080/artboard/${attr.id}`}>
        <TelegramIcon size={32} round={true} />
      </TelegramShareButton> */}
      <div className={classes.items}>{items.length} items </div>

      {items.length === 0 && (
        <p
          style={{
            fontSize: 12,
            paddingLeft: 10,
          }}
        >
          Add some NFT to this artboard
        </p>
      )}
    </Link>
  );
};

export default ArtBoard;
