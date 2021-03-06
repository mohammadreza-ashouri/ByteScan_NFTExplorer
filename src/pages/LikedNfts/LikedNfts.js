import React, { useCallback, useEffect, useState } from 'react';
import { useMoralis, useMoralisQuery } from 'react-moralis';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Link } from 'react-router-dom';
import classes from './LikedNfts.module.scss';
import * as raribleApi from 'api/rarible';
import HeaderComponent from '../../components/Header/HeaderComponent';
import FooterNav from '../../components/FooterNav/FooterNav';
import { createArtboard, getArtboards } from '../../api';
import ArtBoard from '../../components/ArtBoard/ArtBoard';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import { TelegramShareButton, TelegramIcon, TwitterShareButton, TwitterIcon } from 'react-share';

function LikedNfts() {
  const [items, setItems] = useState([]);
  const [artboards, setArtboards] = useState([]);
  const [newName, setNewName] = useState('');
  const [modalIsOpen, setIsOpen] = useState(false);
  const [addToArtboardModalIsOpen, setAddToArtboardModalIsOpen] = useState(false);

  const { user } = useMoralis();

  const { data, isLoading, error } = useMoralisQuery(
    'Likes',
    (query) =>
      query.equalTo('user', user).equalTo('like', true).exists('nftId').descending('createdAt'),
    [user]
  );

  async function getItemById(id) {
    try {
      const item = await raribleApi.getItemById(id, true);
      return item.data;
    } catch (error) {
      console.error(error);
    }
  }

  const addArtboard = async (name) => {
    if (!name) return;
    setNewName('');
    setIsOpen(false);
    await createArtboard(name, user);
    await getData();
  };

  const addToArtboard = async (itemId, id) => {
    let images = [items[itemId]];
    if (artboards[id]?.attributes?.items) {
      images = [...artboards[id].attributes.items, ...images];
    }
    artboards[id].save({
      items: images,
    });
  };
  const getData = useCallback(async () => {
    if (user) {
      const d = await getArtboards(user);
      setArtboards(d);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      await getData();
    })();
  }, [getData, user]);

  useEffect(() => {
    (async () => {
      if (!data.length) {
        return;
      }

      const promises = [];

      data.forEach((item) => {
        promises.push(getItemById(item.attributes.nftId));
      });

      try {
        const items = await Promise.all(promises);

        setItems(items);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [data]);

  return (
    <div className={classes.likedWrapper}>
      <HeaderComponent />
      {isLoading ? (
        'Loading...'
      ) : error ? (
        <p>Error: {error}</p>
      ) : data.length === 0 ? (
        'You not have nft'
      ) : (
        <div>
          <div className={classes.topWrapper}>
            <div className={classes.topHeader}>
              <span>Art Boards: {artboards.length} boards</span>
              <button
                onClick={() => {
                  setIsOpen(true);
                }}
                className={classes.topButton}
              >
                Create artboard
              </button>
            </div>
            <Modal
              open={modalIsOpen}
              onClose={() => {
                setIsOpen(false);
              }}
              center
            >
              <div className={classes.addArtboardContainer}>
                <p
                  style={{
                    color: 'white',
                  }}
                >
                  Create artboard to add your liked NFTs
                </p>
                <input
                  placeholder="Artboard name"
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                  }}
                />
                <button
                  className={classes.topButton}
                  onClick={() => {
                    addArtboard(newName);
                  }}
                >
                  Create
                </button>
              </div>
            </Modal>
            <div className={classes.artBoardWrapper}>
              {artboards.map((art) => (
                <ArtBoard attr={art} key={art.attributes.name} />
              ))}
            </div>
          </div>

          {items.length > 0 && <h3>Your liked NFTs ({items.length})</h3>}
          <ResponsiveMasonry columnsCountBreakPoints={{ 100: 1, 400: 2, 700: 3, 1000: 4 }}>
            <Masonry>
              {items.map((item, itemID) => {
                const { name, image } = item.meta;

                const { ORIGINAL, BIG } = image?.url || {};

                if (
                  [ORIGINAL || 'ipfs:', BIG || 'ipfs:'].every((image) => image.includes('ipfs:'))
                ) {
                  return null;
                }

                // if (
                //   image?.url?.ORIGINAL.includes('mp4') ||
                //   image?.url?.ORIGINAL.includes('ipfs://')
                // )
                //   return null;
                return (
                  <div className={classes.card} to={`/detail/${item.id}`} key={name}>
                    <Link to={`/detail/${item.id}`} key={name}>
                      <img src={ORIGINAL.includes('ipfs:') ? BIG : ORIGINAL} alt={name} />
                    </Link>
                    <div className={classes.cardName}>
                      <span>{name}</span>
                      <TwitterShareButton
                        title={name}
                        image={ORIGINAL.includes('ipfs:') ? BIG : ORIGINAL}
                        url={`https://localhost:8080/detail/${item.id}`}
                      >
                        <TwitterIcon size={32} round={true} />
                      </TwitterShareButton>
                      <TelegramShareButton
                        title={name}
                        url={`https://localhost:8080/detail/${item.id}`}
                      >
                        <TelegramIcon size={32} round={true} />
                      </TelegramShareButton>
                      {artboards.length > 0 && (
                        <button
                          className={classes.topButton}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAddToArtboardModalIsOpen(itemID);
                          }}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <Modal
                open={addToArtboardModalIsOpen !== false}
                onClose={() => {
                  setAddToArtboardModalIsOpen(false);
                }}
                center
              >
                <div className={classes.artModalContainer}>
                  {artboards.map((art, index) => (
                    <button
                      className={classes.topButton}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToArtboard(addToArtboardModalIsOpen, index);
                        setAddToArtboardModalIsOpen(false);
                      }}
                      key={art.attributes.name}
                    >
                      {art.attributes.name}
                    </button>
                  ))}
                </div>
              </Modal>
            </Masonry>
          </ResponsiveMasonry>
        </div>
      )}
      <FooterNav />
    </div>
  );
}

export default LikedNfts;
