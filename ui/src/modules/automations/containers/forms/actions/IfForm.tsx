import React from 'react';
import Form from '../../../components/forms/actions/IfForm';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { LeadIntegrationsQueryResponse } from 'modules/leads/types';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/forms/graphql';
import { IAction, ITrigger } from 'modules/automations/types';
import client from 'erxes-ui/lib/apolloClient';
import { IField } from 'modules/settings/properties/types';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  activeAction: IAction;
  activeTrigger: ITrigger;
  addAction: (value: string, contentId?: string, config?: any) => void;
};

type FinalProps = {
  integrationsQuery: LeadIntegrationsQueryResponse;
} & Props;

class IfForm extends React.Component<FinalProps> {
  fetchFormFields = (formId: string, callback: (fields: IField[]) => void) => {
    client
      .query({
        query: gql(queries.fields),
        fetchPolicy: 'network-only',
        variables: { contentType: 'form', contentTypeId: formId }
      })
      .then(({ data }: any) => {
        callback(data.fields);
      });
  };

  render() {
    const extendedProps = {
      ...this.props,
      fetchFormFields: this.fetchFormFields
    };

    return <Form {...extendedProps} />;
  }
}

export default withProps<Props>(compose()(IfForm));