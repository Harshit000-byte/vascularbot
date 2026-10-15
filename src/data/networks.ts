import { VascularNetwork } from '../types/vascular';
import { cardiacCoronaryNetwork } from './cardiacNetwork';

/**
 * Preset 1: Cerebral Microcirculation & Circle of Willis
 * Features high-velocity carotid arterial flow vs collateral cortical venous shunts.
 * Highlighting how systolic heartbeat pulse diverts the nanobot from fierce arterial currents.
 */
export const cerebralNetwork: VascularNetwork = {
  id: 'cerebral',
  name: 'Cerebral Microcirculation (Circle of Willis)',
  description: 'Internal carotid arterial feed branching into cerebral vessels targeting a glioblastoma multiforme.',
  defaultStartId: 'node_inject',
  defaultTargetId: 'node_tumor',
  nodes: [
    { id: 'node_inject', x: 80, y: 350, type: 'injection_site', label: 'Micro-Catheter Port' },
    
    // Main Arterial Trunk (High velocity, wide radius)
    { id: 'node_ica_1', x: 180, y: 350, type: 'artery', label: 'Internal Carotid' },
    { id: 'node_ica_bifurc', x: 280, y: 350, type: 'artery', label: 'Carotid Bifurcation' },
    { id: 'node_mca_main', x: 400, y: 260, type: 'artery', label: 'MCA Trunk' },
    { id: 'node_aca_main', x: 400, y: 440, type: 'artery', label: 'ACA Trunk' },
    
    // Upper Arteriole & Capillary Bed
    { id: 'node_mca_branch1', x: 530, y: 200, type: 'artery', label: 'Superior MCA Branch' },
    { id: 'node_mca_branch2', x: 550, y: 300, type: 'artery', label: 'Inferior MCA Branch' },
    { id: 'node_arteriole_top', x: 670, y: 220, type: 'artery', label: 'Pial Arteriole' },

    // Lower Arterial & Collateral Bed
    { id: 'node_aca_branch', x: 540, y: 480, type: 'artery', label: 'Pericallosal Artery' },
    { id: 'node_arteriole_low', x: 670, y: 460, type: 'artery', label: 'Callosomarginal' },

    // Venous Pathways (Blue return vessels)
    { id: 'node_venule_up', x: 690, y: 130, type: 'vein', label: 'Cortical Venule' },
    { id: 'node_sss_vein', x: 520, y: 110, type: 'vein', label: 'Sagittal Sinus Shunt' },
    { id: 'node_jugular_drain', x: 300, y: 140, type: 'vein', label: 'Internal Jugular Drain' },

    { id: 'node_venule_low', x: 680, y: 560, type: 'vein', label: 'Basal Venule' },
    { id: 'node_deep_vein', x: 480, y: 570, type: 'vein', label: 'Deep Cerebral Vein' },

    // Intermediate Anastomosis / Shunt nodes
    { id: 'node_shunt_mid', x: 630, y: 350, type: 'artery', label: 'Microvascular Plexus' },
    { id: 'node_tumor_feeder_a', x: 790, y: 280, type: 'artery', label: 'Angiogenic Feeder A' },
    { id: 'node_tumor_feeder_b', x: 790, y: 410, type: 'vein', label: 'Tumor Draining Venule' },

    // Target Tumor
    { id: 'node_tumor', x: 890, y: 350, type: 'tumor', label: 'Glioblastoma Neoplasm' }
  ],
  edges: [
    // Catheter to Carotid
    {
      source: 'node_inject',
      target: 'node_ica_1',
      length: 100,
      radius: 8.0,
      blood_velocity: 14.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Catheter Canal'
    },
    // Carotid Trunk to Bifurcation
    {
      source: 'node_ica_1',
      target: 'node_ica_bifurc',
      length: 100,
      radius: 7.5,
      blood_velocity: 16.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Common Carotid Segment'
    },
    // Bifurcation to MCA
    {
      source: 'node_ica_bifurc',
      target: 'node_mca_main',
      length: 150,
      radius: 6.0,
      blood_velocity: 18.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Middle Cerebral Artery'
    },
    // Bifurcation to ACA
    {
      source: 'node_ica_bifurc',
      target: 'node_aca_main',
      length: 150,
      radius: 5.5,
      blood_velocity: 13.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Anterior Cerebral Artery'
    },
    // MCA branches
    {
      source: 'node_mca_main',
      target: 'node_mca_branch1',
      length: 140,
      radius: 4.2,
      blood_velocity: 12.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Sylvian Artery Branch 1'
    },
    {
      source: 'node_mca_main',
      target: 'node_mca_branch2',
      length: 150,
      radius: 4.5,
      blood_velocity: 14.5,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Sylvian Artery Branch 2'
    },
    // Direct central path from branch2 to shunt (Narrow high-speed choke point)
    {
      source: 'node_mca_branch2',
      target: 'node_shunt_mid',
      length: 90,
      radius: 2.1,
      blood_velocity: 15.0,
      flow_direction: 'target_to_source', // NOTE: flow runs AGAINST injection direction! High penalty!
      type: 'artery',
      name: 'Retrograde Capillary Choke'
    },
    // Shunt to tumor feeder A
    {
      source: 'node_shunt_mid',
      target: 'node_tumor_feeder_a',
      length: 170,
      radius: 3.2,
      blood_velocity: 8.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Peritumoral Arteriole'
    },
    // Upper route via Pial Arteriole
    {
      source: 'node_mca_branch1',
      target: 'node_arteriole_top',
      length: 140,
      radius: 3.8,
      blood_velocity: 7.5,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Distal Cortical Arteriole'
    },
    {
      source: 'node_arteriole_top',
      target: 'node_tumor_feeder_a',
      length: 135,
      radius: 4.0,
      blood_velocity: 6.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Tumor Penetrating Arteriole'
    },
    // ACA to branch
    {
      source: 'node_aca_main',
      target: 'node_aca_branch',
      length: 145,
      radius: 4.5,
      blood_velocity: 9.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Pericallosal Branch'
    },
    {
      source: 'node_aca_branch',
      target: 'node_arteriole_low',
      length: 130,
      radius: 3.6,
      blood_velocity: 7.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Inferior Arteriole'
    },
    {
      source: 'node_arteriole_low',
      target: 'node_tumor_feeder_b',
      length: 135,
      radius: 3.4,
      blood_velocity: 5.5,
      flow_direction: 'source_to_target',
      type: 'vein',
      name: 'Inferior Anastomosis'
    },
    // Venous return paths (with reverse flow direction)
    {
      source: 'node_arteriole_top',
      target: 'node_venule_up',
      length: 95,
      radius: 4.8,
      blood_velocity: 4.0,
      flow_direction: 'source_to_target',
      type: 'vein',
      name: 'Cortical Venous Bridge'
    },
    {
      source: 'node_venule_up',
      target: 'node_sss_vein',
      length: 170,
      radius: 6.0,
      blood_velocity: 5.0,
      flow_direction: 'source_to_target',
      type: 'vein',
      name: 'Sagittal Sinus Return'
    },
    {
      source: 'node_sss_vein',
      target: 'node_jugular_drain',
      length: 220,
      radius: 7.0,
      blood_velocity: 6.5,
      flow_direction: 'source_to_target',
      type: 'vein',
      name: 'Internal Jugular Conduit'
    },
    {
      source: 'node_jugular_drain',
      target: 'node_ica_1',
      length: 230,
      radius: 5.5,
      blood_velocity: 4.5,
      flow_direction: 'target_to_source',
      type: 'vein',
      name: 'Arteriovenous Fistula Bridge'
    },
    // Lower deep vein return
    {
      source: 'node_arteriole_low',
      target: 'node_venule_low',
      length: 100,
      radius: 4.2,
      blood_velocity: 3.8,
      flow_direction: 'source_to_target',
      type: 'vein',
      name: 'Basal Venule Link'
    },
    {
      source: 'node_venule_low',
      target: 'node_deep_vein',
      length: 200,
      radius: 5.8,
      blood_velocity: 5.0,
      flow_direction: 'source_to_target',
      type: 'vein',
      name: 'Deep Internal Cerebral Vein'
    },
    {
      source: 'node_deep_vein',
      target: 'node_ica_bifurc',
      length: 290,
      radius: 5.0,
      blood_velocity: 4.0,
      flow_direction: 'target_to_source',
      type: 'vein',
      name: 'Collateral Basal Shunt'
    },
    // Feeder connections to Tumor
    {
      source: 'node_tumor_feeder_a',
      target: 'node_tumor',
      length: 120,
      radius: 3.0,
      blood_velocity: 6.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Superior Neo-Capillary Feed'
    },
    {
      source: 'node_tumor_feeder_b',
      target: 'node_tumor',
      length: 120,
      radius: 3.2,
      blood_velocity: 5.0,
      flow_direction: 'source_to_target',
      type: 'vein',
      name: 'Inferior Neo-Vascular Drainage'
    },
    // Cross anastomosis between upper and lower beds
    {
      source: 'node_mca_branch2',
      target: 'node_aca_branch',
      length: 180,
      radius: 2.8,
      blood_velocity: 6.0,
      flow_direction: 'source_to_target',
      type: 'artery',
      name: 'Inter-arterial Anastomosis'
    }
  ]
};

/**
 * Preset 2: Coronary Angiogenesis Network
 * Concentrated around myocardial vessels supplying a cardiac tumor.
 */
export const coronaryNetwork: VascularNetwork = {
  id: 'coronary',
  name: 'Coronary Vascular System',
  description: 'Left Anterior Descending (LAD) and Circumflex Arteries feeding cardiac capillaries and tumor.',
  defaultStartId: 'cor_start',
  defaultTargetId: 'cor_tumor',
  nodes: [
    { id: 'cor_start', x: 80, y: 300, type: 'injection_site', label: 'Coronary Ostium Catheter' },
    { id: 'cor_lmca', x: 200, y: 300, type: 'artery', label: 'Left Main Trunk' },
    { id: 'cor_lad_prox', x: 340, y: 200, type: 'artery', label: 'Proximal LAD' },
    { id: 'cor_lcx_prox', x: 340, y: 400, type: 'artery', label: 'Proximal LCx' },
    { id: 'cor_diag1', x: 480, y: 160, type: 'artery', label: 'Diagonal D1' },
    { id: 'cor_lad_mid', x: 500, y: 250, type: 'artery', label: 'Mid LAD' },
    { id: 'cor_om1', x: 490, y: 440, type: 'artery', label: 'Obtuse Marginal 1' },
    { id: 'cor_lcx_dist', x: 520, y: 350, type: 'artery', label: 'Distal LCx' },
    { id: 'cor_capillary_bed', x: 660, y: 210, type: 'artery', label: 'Myocardial Capillary' },
    { id: 'cor_vein_great', x: 670, y: 410, type: 'vein', label: 'Great Cardiac Vein' },
    { id: 'cor_sinus', x: 380, y: 520, type: 'vein', label: 'Coronary Sinus' },
    { id: 'cor_septal', x: 640, y: 310, type: 'artery', label: 'Septal Perforator' },
    { id: 'cor_tumor', x: 850, y: 300, type: 'tumor', label: 'Cardiac Myxoma Tumor' }
  ],
  edges: [
    { source: 'cor_start', target: 'cor_lmca', length: 120, radius: 8.0, blood_velocity: 18.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'cor_lmca', target: 'cor_lad_prox', length: 140, radius: 6.5, blood_velocity: 17.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'cor_lmca', target: 'cor_lcx_prox', length: 140, radius: 5.8, blood_velocity: 14.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'cor_lad_prox', target: 'cor_diag1', length: 140, radius: 4.2, blood_velocity: 11.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'cor_lad_prox', target: 'cor_lad_mid', length: 160, radius: 5.0, blood_velocity: 15.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'cor_lcx_prox', target: 'cor_om1', length: 150, radius: 4.5, blood_velocity: 10.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'cor_lcx_prox', target: 'cor_lcx_dist', length: 180, radius: 4.0, blood_velocity: 9.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'cor_diag1', target: 'cor_capillary_bed', length: 180, radius: 3.2, blood_velocity: 6.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'cor_lad_mid', target: 'cor_septal', length: 150, radius: 2.2, blood_velocity: 12.0, flow_direction: 'target_to_source', type: 'artery' }, // high resistance counter-current
    { source: 'cor_om1', target: 'cor_vein_great', length: 180, radius: 5.2, blood_velocity: 6.5, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'cor_vein_great', target: 'cor_sinus', length: 300, radius: 7.2, blood_velocity: 8.0, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'cor_sinus', target: 'cor_lmca', length: 280, radius: 6.0, blood_velocity: 4.0, flow_direction: 'target_to_source', type: 'vein' },
    { source: 'cor_capillary_bed', target: 'cor_tumor', length: 200, radius: 3.5, blood_velocity: 5.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'cor_septal', target: 'cor_tumor', length: 210, radius: 3.0, blood_velocity: 4.5, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'cor_vein_great', target: 'cor_tumor', length: 210, radius: 4.0, blood_velocity: 5.5, flow_direction: 'target_to_source', type: 'vein' },
    { source: 'cor_lcx_dist', target: 'cor_septal', length: 130, radius: 3.0, blood_velocity: 4.0, flow_direction: 'source_to_target', type: 'artery' }
  ]
};

/**
 * Preset 3: Hepatic Portal & Mesenteric Bed
 * Liver microcirculation with low-velocity portal vein bypass vs hepatic artery.
 */
export const hepaticNetwork: VascularNetwork = {
  id: 'hepatic',
  name: 'Hepatic Microcirculation & Portal Shunts',
  description: 'Portal vein and hepatic artery bifurcating into sinusoids to reach a hepatocellular carcinoma.',
  defaultStartId: 'hep_inj',
  defaultTargetId: 'hep_tumor',
  nodes: [
    { id: 'hep_inj', x: 80, y: 320, type: 'injection_site', label: 'Trans-Hepatic Catheter' },
    { id: 'hep_ha', x: 230, y: 220, type: 'artery', label: 'Proper Hepatic Artery' },
    { id: 'hep_pv', x: 230, y: 420, type: 'vein', label: 'Portal Vein' },
    { id: 'hep_rha', x: 400, y: 180, type: 'artery', label: 'Right Hepatic Artery' },
    { id: 'hep_lha', x: 400, y: 270, type: 'artery', label: 'Left Hepatic Artery' },
    { id: 'hep_rpv', x: 400, y: 370, type: 'vein', label: 'Right Portal Branch' },
    { id: 'hep_lpv', x: 400, y: 460, type: 'vein', label: 'Left Portal Branch' },
    { id: 'hep_sinusoid_1', x: 580, y: 200, type: 'artery', label: 'Hepatic Sinusoid Zone 1' },
    { id: 'hep_sinusoid_2', x: 580, y: 320, type: 'artery', label: 'Central Sinusoid Zone 2' },
    { id: 'hep_sinusoid_3', x: 580, y: 440, type: 'vein', label: 'Sinusoid Zone 3' },
    { id: 'hep_central_vein', x: 740, y: 240, type: 'vein', label: 'Central Lobular Vein' },
    { id: 'hep_bypass_shunt', x: 740, y: 400, type: 'vein', label: 'Portosystemic Shunt' },
    { id: 'hep_tumor', x: 880, y: 320, type: 'tumor', label: 'Hepatocellular Tumor' }
  ],
  edges: [
    { source: 'hep_inj', target: 'hep_ha', length: 170, radius: 6.0, blood_velocity: 16.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'hep_inj', target: 'hep_pv', length: 170, radius: 9.0, blood_velocity: 8.0, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'hep_ha', target: 'hep_rha', length: 170, radius: 4.8, blood_velocity: 14.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'hep_ha', target: 'hep_lha', length: 170, radius: 4.5, blood_velocity: 12.0, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'hep_pv', target: 'hep_rpv', length: 170, radius: 7.5, blood_velocity: 7.0, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'hep_pv', target: 'hep_lpv', length: 170, radius: 7.0, blood_velocity: 6.5, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'hep_rha', target: 'hep_sinusoid_1', length: 180, radius: 2.8, blood_velocity: 11.0, flow_direction: 'target_to_source', type: 'artery' }, // counter flow!
    { source: 'hep_lha', target: 'hep_sinusoid_2', length: 180, radius: 3.5, blood_velocity: 8.5, flow_direction: 'source_to_target', type: 'artery' },
    { source: 'hep_rpv', target: 'hep_sinusoid_2', length: 180, radius: 5.5, blood_velocity: 5.5, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'hep_lpv', target: 'hep_sinusoid_3', length: 180, radius: 6.0, blood_velocity: 5.0, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'hep_sinusoid_1', target: 'hep_central_vein', length: 160, radius: 4.2, blood_velocity: 4.0, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'hep_sinusoid_2', target: 'hep_central_vein', length: 160, radius: 4.0, blood_velocity: 4.5, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'hep_sinusoid_3', target: 'hep_bypass_shunt', length: 160, radius: 5.0, blood_velocity: 3.5, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'hep_central_vein', target: 'hep_tumor', length: 160, radius: 3.5, blood_velocity: 4.2, flow_direction: 'source_to_target', type: 'vein' },
    { source: 'hep_bypass_shunt', target: 'hep_tumor', length: 160, radius: 3.8, blood_velocity: 3.8, flow_direction: 'source_to_target', type: 'vein' }
  ]
};

export { cardiacCoronaryNetwork };

export const PRESET_NETWORKS: VascularNetwork[] = [
  cardiacCoronaryNetwork,
  cerebralNetwork,
  coronaryNetwork,
  hepaticNetwork
];
