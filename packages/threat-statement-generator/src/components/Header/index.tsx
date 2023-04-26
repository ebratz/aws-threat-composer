/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 ******************************************************************************************************************** */
import Button from '@cloudscape-design/components/button';
import HeaderComponent from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { FC, useMemo } from 'react';
import { TemplateThreatStatement } from '../../customTypes';

export interface HeaderProps {
  saveButtonText: string;
  statement: TemplateThreatStatement;
  onCancel?: () => void;
  onComplete?: () => void;
  onStartOver?: () => void;
}

const Header: FC<HeaderProps> = ({ statement, saveButtonText, onComplete, onCancel, onStartOver }) => {
  const actions = useMemo(() => {
    return (
      <SpaceBetween direction="horizontal" size="xs">
        <Button onClick={onCancel}>Threat list</Button>
        <Button onClick={onStartOver}>Start over</Button>
        <Button variant="primary" onClick={onComplete} disabled={!statement.statement}>
          {saveButtonText}
        </Button>
      </SpaceBetween>);
  }, [onComplete, onCancel, onStartOver]);
  return (
    <HeaderComponent variant='h1' actions={actions}>{statement.id === -1 ? <span style={{
      visibility: 'hidden',
    }}>New threat</span> : `Threat ${statement.id}`}</HeaderComponent>
  );
};

export default Header;