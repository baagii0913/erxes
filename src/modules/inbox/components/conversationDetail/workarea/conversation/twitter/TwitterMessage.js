import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NameCard, Tip, Icon, ModalTrigger } from 'modules/common/components';
import { TweetContent, TweetMedia, ModalAction } from './';
import { Tweet, User, Counts, Count, Time, Reply } from './styles';

const propTypes = {
  message: PropTypes.object.isRequired,
  staff: PropTypes.bool,
  integrationId: PropTypes.string,
  favoriteTweet: PropTypes.func,
  retweet: PropTypes.func,
  replyTweet: PropTypes.func,
  tweet: PropTypes.func
};

class TwitterMessage extends Component {
  constructor(props) {
    super(props);

    this.renderReply = this.renderReply.bind(this);
    this.renderTweetLink = this.renderTweetLink.bind(this);
    this.renderUserLink = this.renderUserLink.bind(this);
    this.favoriteTweet = this.favoriteTweet.bind(this);
  }

  favoriteTweet() {
    const { message, favoriteTweet, integrationId } = this.props;
    const twitterData = message.twitterData || {};

    const tweet = {
      integrationId,
      id: twitterData.id_str
    };

    favoriteTweet(tweet);
  }

  renderUserLink(username, fullName, customer) {
    if (!username) {
      return <div>{customer.firstName}</div>;
    }

    return (
      <a target="_blank" href={`https://twitter.com/${username}`}>
        {fullName ? <b>{fullName} </b> : `@${username}`}
      </a>
    );
  }

  renderTweetLink() {
    const { message } = this.props;
    const messageDate = message.twitterData.created_at;
    const idStr = message.twitterData.id_str;

    return (
      <Tip text={moment(messageDate).format('lll')}>
        <Time href={`https://twitter.com/statuses/${idStr}`} target="_blank">
          {moment(messageDate).fromNow()}
        </Time>
      </Tip>
    );
  }

  renderCounts(twitterData) {
    const inReplyStatus = twitterData.in_reply_to_status_id ? false : true;
    const { favorited, retweeted } = twitterData;
    const { integrationId, retweet, replyTweet, tweet, message } = this.props;

    return (
      <Counts root={inReplyStatus}>
        <ModalTrigger
          title="Reply tweet"
          trigger={
            <Count>
              <Icon icon="chat" /> Reply • {twitterData.reply_count || 0}
            </Count>
          }
        >
          <ModalAction
            type="reply"
            integrationId={integrationId}
            replyTweet={replyTweet}
            parentMessage={message}
          />
        </ModalTrigger>
        <ModalTrigger
          title="Retweet"
          trigger={
            <Count retweeted={retweeted}>
              <Icon icon="repeat" /> Retweet • {twitterData.retweet_count || 0}
            </Count>
          }
        >
          <ModalAction
            type="retweet"
            integrationId={integrationId}
            retweet={retweet}
            parentMessage={message}
          />
        </ModalTrigger>
        <Count favorited={favorited} onClick={this.favoriteTweet}>
          <Icon icon="heart" /> Favorite • {twitterData.favorite_count || 0}
        </Count>
        <ModalTrigger
          title="Twitter quote"
          trigger={
            <Count>
              <Icon icon="rightquote" /> Quote • {twitterData.quote_count || 0}
            </Count>
          }
        >
          <ModalAction
            type="quote"
            integrationId={integrationId}
            tweet={tweet}
            parentMessage={message}
          />
        </ModalTrigger>
      </Counts>
    );
  }

  renderReply(twitterData, inReplyStatus) {
    if (inReplyStatus) {
      return null;
    }

    return (
      <Reply>
        Replying to {this.renderUserLink(twitterData.in_reply_to_screen_name)}
      </Reply>
    );
  }

  getTweetContent(extendedTweet, message) {
    if (extendedTweet) {
      return extendedTweet.full_text;
    }

    return message.content;
  }

  getEntities(extendedTweet, twitterData) {
    if (extendedTweet) {
      return extendedTweet.entities;
    }

    return twitterData.entities;
  }

  render() {
    const { message } = this.props;

    // customer
    const customer = message.customer || {};
    const twitterCustomer = customer.twitterData;
    const twitterName = twitterCustomer.name;
    const twitterUsername = twitterCustomer.screen_name;

    // twitter data
    const twitterData = message.twitterData;
    const extendedTweet = twitterData.extended_tweet;
    const tweetContent = this.getTweetContent(extendedTweet, message);
    const entities = this.getEntities(extendedTweet, twitterData);
    const inReplyStatus = twitterData.in_reply_to_status_id ? false : true;

    return (
      <Tweet root={inReplyStatus}>
        <NameCard.Avatar customer={customer} />

        <User root={inReplyStatus}>
          {this.renderUserLink(twitterUsername, twitterName, customer)}
          {twitterUsername && <span>@{twitterUsername}</span>}
          {this.renderTweetLink()}
        </User>
        <div>
          {this.renderReply(twitterData, inReplyStatus)}
          <TweetContent content={tweetContent} entities={entities} />
          <TweetMedia data={twitterData} />
          {this.renderCounts(twitterData)}
        </div>
      </Tweet>
    );
  }
}

TwitterMessage.propTypes = propTypes;

export default TwitterMessage;
