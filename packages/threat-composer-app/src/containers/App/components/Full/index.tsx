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
import {
  ContextAggregator,
  DataExchangeFormat,
  ThreatStatementListFilter,
  WorkspaceSelector,
  useWorkspacesContext,
  APP_MODE_BROWSER_EXTENSION,
  APP_MODE_IDE_EXTENSION,
} from '@aws/threat-composer';
import { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import React, { FC, useMemo, useCallback, useState, useEffect } from 'react';
import { Routes, Route, RouteProps, useParams, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import AppLayout from '../../../../components/FullAppLayout';
import {
  ROUTE_APPLICATION_INFO,
  ROUTE_ARCHITECTURE_INFO,
  ROUTE_ASSUMPTION_LIST,
  ROUTE_DATAFLOW_INFO,
  ROUTE_THREAT_PACKS,
  ROUTE_MITIGATION_LIST,
  ROUTE_THREAT_EDITOR,
  ROUTE_THREAT_LIST,
  ROUTE_VIEW_THREAT_MODEL,
  ROUTE_WORKSPACE_HOME,
  ROUTE_MITIGATION_PACKS,
} from '../../../../config/routes';
import { SEARCH_PARAM_FEATURES } from '../../../../config/searchParams';
import useNotifications from '../../../../hooks/useNotifications';
import routes from '../../../../routes';
import generateUrl from '../../../../utils/generateUrl';
import ThreatModelReport from '../../../ThreatModelReport';

const TEMP_PREVIEW_DATA_KEY = 'ThreatStatementGenerator.TempPreviewData';

const defaultHref = process.env.PUBLIC_URL || '/';
const appMode = process.env.REACT_APP_APP_MODE;

const AppInner: FC<{
  setWorkspaceId: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setWorkspaceId }) => {
  const { currentWorkspace } = useWorkspacesContext();
  const [searchParms] = useSearchParams();
  useEffect(() => {
    setWorkspaceId(currentWorkspace?.id || 'default');
  }, [currentWorkspace]);

  const workspaceHome = generateUrl(ROUTE_WORKSPACE_HOME, searchParms, currentWorkspace?.id || 'default');

  return (<Routes>
    <Route path='/' element={<Navigate replace to={workspaceHome} />} />
    {routes.map((r: RouteProps, index: number) => <Route key={index} {...r} />)}
    <Route path='*' element={<Navigate replace to={workspaceHome} />} />
  </Routes>);
};

const Full: FC = () => {
  const { workspaceId: initialWorkspaceId } = useParams();
  const [searchParms] = useSearchParams();
  const navigate = useNavigate();

  const [isPreview] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const previewParams = urlParams.get('preview');
    return previewParams === 'true';
  });

  const [features] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const featureParam = urlParams.get(SEARCH_PARAM_FEATURES);
    return featureParam && featureParam.split(',') || [];
  });

  const isThreatPackFeatureOn = useMemo(() => {
    return features.includes('threatPacks');
  }, [features]);

  const [workspaceId, setWorkspaceId] = useState(initialWorkspaceId || 'default');

  const handleWorkspaceChanged = useCallback((newWorkspaceId: string) => {
    navigate(generateUrl(ROUTE_WORKSPACE_HOME, searchParms, newWorkspaceId));
  }, [navigate, workspaceId, searchParms]);

  const handleNavigationView = useCallback((route: string) => {
    navigate(generateUrl(route, searchParms, workspaceId));
  }, [navigate]);

  const handleThreatListView = useCallback((filter?: ThreatStatementListFilter) => {
    navigate(generateUrl(ROUTE_THREAT_LIST, searchParms, workspaceId), {
      state: filter ? {
        filter,
      } : undefined,
    });
  }, [navigate, workspaceId, searchParms]);

  const handleThreatEditorView = useCallback((newThreatId: string, idToCopy?: string) => {
    navigate(generateUrl(ROUTE_THREAT_EDITOR, searchParms, workspaceId, newThreatId, undefined, idToCopy ? {
      idToCopy,
    } : undefined));
  }, [navigate, workspaceId, searchParms]);

  const navigationItems: SideNavigationProps.Item[] = useMemo(() => {
    const navItems: SideNavigationProps.Item[] = [
      {
        text: 'Dashboard',
        href: generateUrl(ROUTE_WORKSPACE_HOME, searchParms, workspaceId),
        type: 'link',
      },
      {
        text: 'Application info',
        href: generateUrl(ROUTE_APPLICATION_INFO, searchParms, workspaceId),
        type: 'link',
      },
      {
        text: 'Architecture',
        href: generateUrl(ROUTE_ARCHITECTURE_INFO, searchParms, workspaceId),
        type: 'link',
      },
      {
        text: 'Dataflow',
        href: generateUrl(ROUTE_DATAFLOW_INFO, searchParms, workspaceId),
        type: 'link',
      },
      {
        text: 'Assumptions',
        href: generateUrl(ROUTE_ASSUMPTION_LIST, searchParms, workspaceId),
        type: 'link',
      },
      {
        text: 'Threats',
        href: generateUrl(ROUTE_THREAT_LIST, searchParms, workspaceId),
        type: 'link',
      },
      {
        text: 'Mitigations',
        href: generateUrl(ROUTE_MITIGATION_LIST, searchParms, workspaceId),
        type: 'link',
      },
      { type: 'divider' },
      {
        text: 'Threat model',
        href: generateUrl(ROUTE_VIEW_THREAT_MODEL, searchParms, workspaceId),
        type: 'link',
      },
    ];
    return isThreatPackFeatureOn ? navItems.concat([
      { type: 'divider' },
      {
        type: 'section',
        text: 'Reference packs',
        items: [
          {
            text: 'Threat packs',
            href: generateUrl(ROUTE_THREAT_PACKS, searchParms, workspaceId),
            type: 'link',
          },
          {
            text: 'Mitigation packs',
            href: generateUrl(ROUTE_MITIGATION_PACKS, searchParms, workspaceId),
            type: 'link',
          },
        ],
      },
    ]) : navItems;

  }, [searchParms, workspaceId, isThreatPackFeatureOn]);

  const handlePreview = useCallback((data: DataExchangeFormat) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('preview', 'true');
    window.localStorage.setItem(TEMP_PREVIEW_DATA_KEY, JSON.stringify(data));
    urlParams.set('dataKey', TEMP_PREVIEW_DATA_KEY);
    window.open(`${window.location.pathname}?${urlParams.toString()}`, '_blank', 'noopener,noreferrer,resizable');
  }, []);

  const handleImported = useCallback(() => {
    navigate(generateUrl(ROUTE_VIEW_THREAT_MODEL, searchParms, workspaceId));
  }, [navigate, workspaceId, searchParms]);

  const handleDefineWorkload = useCallback(() => {
    navigate(generateUrl(ROUTE_APPLICATION_INFO, searchParms, workspaceId));
  }, [navigate, workspaceId, searchParms]);

  const notifications = useNotifications();

  return (
    <ContextAggregator
      composerMode='Full'
      onWorkspaceChanged={handleWorkspaceChanged}
      onApplicationInfoView={() => handleNavigationView(ROUTE_APPLICATION_INFO)}
      onArchitectureView={() => handleNavigationView(ROUTE_ARCHITECTURE_INFO)}
      onDataflowView={() => handleNavigationView(ROUTE_DATAFLOW_INFO)}
      onAssumptionListView={() => handleNavigationView(ROUTE_ASSUMPTION_LIST)}
      onMitigationListView={() => handleNavigationView(ROUTE_MITIGATION_LIST)}
      onThreatListView={handleThreatListView}
      onThreatEditorView={handleThreatEditorView}
      onPreview={handlePreview}
      onImported={handleImported}
      onDefineWorkload={handleDefineWorkload}
    >
      {isPreview ? (
        <ThreatModelReport />
      ) : (<AppLayout
        title='threat-composer'
        href={defaultHref}
        navigationItems={navigationItems}
        availableRoutes={routes.map(x => x.path || '')}
        breadcrumbGroup={<WorkspaceSelector
          singletonMode={appMode === APP_MODE_BROWSER_EXTENSION || appMode === APP_MODE_IDE_EXTENSION}
          singletonPrimaryActionButtonConfig={appMode === APP_MODE_IDE_EXTENSION ? {
            text: 'Save',
            eventName: 'save',
          } : undefined}
          embededMode={false}
        />}
        notifications={notifications}
      >
        <AppInner setWorkspaceId={setWorkspaceId} />
      </AppLayout>)}
    </ContextAggregator>
  );
};

export default Full;
