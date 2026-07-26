import type { Explanation, ParamValues } from '../ecg/diseases'
import type { Locale } from './locale'

const num = (v: ParamValues, k: string, d: number): number => {
  const raw = v[k]
  return typeof raw === 'number' && !Number.isNaN(raw) ? raw : d
}

const str = (v: ParamValues, k: string, d: string): string => {
  const raw = v[k]
  return typeof raw === 'string' ? raw : d
}

export interface DiseaseUi {
  name: string
  category: string
  short: string
  params: Record<string, { label: string; options?: Record<string, string> }>
  explain: (v: ParamValues) => Explanation
}

/** Chinese (and param-label) overlays keyed by disease id. English uses diseases.ts defaults. */
export const DISEASE_UI_ZH: Record<string, DiseaseUi> = {
  normal: {
    name: '窦性心律',
    category: '基线',
    short: '健康的基线传导与 12 导联形态。',
    params: { heartRate: { label: '心率' } },
    explain: (v) => {
      const hr = num(v, 'heartRate', 72)
      return {
        summary: `窦性心律，心率 ${hr} 次/分。冲动起自窦房结，沿正常传导通路下传。`,
        mechanism: [
          '窦房结自发除极并决定心率。',
          '激动波扩布至双心房（P 波）。',
          '房室结延迟传导（PR 段），使心房有时间排空。',
          '希氏–浦肯野系统迅速激动心室（窄 QRS）。',
          '心室复极形成 T 波。',
        ],
        ecgFindings: [
          '每个 QRS 前可见直立 P 波（II 导联正向，aVR 负向）。',
          'PR 间期 120–200 ms，窄 QRS < 120 ms。',
          'V1→V6 R 波递增正常。',
        ],
        clinical: ['无症状 — 此为对照参考状态。', '用来与疾病图形对比。'],
      }
    },
  },
  stemi: {
    name: '急性心肌梗死（STEMI）',
    category: '心血管',
    short: '冠状动脉闭塞导致区域性 ST 段抬高。',
    params: {
      heartRate: { label: '心率' },
      occlusion: { label: '冠脉闭塞程度' },
      territory: {
        label: '梗死部位',
        options: {
          anterior: '前壁（LAD）— V1–V4',
          inferior: '下壁（RCA）— II、III、aVF',
          lateral: '侧壁（LCx）— I、aVL、V5、V6',
        },
      },
    },
    explain: (v) => {
      const occ = num(v, 'occlusion', 80)
      const territory = str(v, 'territory', 'anterior')
      const label =
        territory === 'anterior'
          ? '前壁（LAD）'
          : territory === 'inferior'
            ? '下壁（RCA）'
            : '侧壁（LCx）'
      const leads =
        territory === 'anterior'
          ? 'V1–V4'
          : territory === 'inferior'
            ? 'II、III、aVF'
            : 'I、aVL、V5、V6'
      return {
        summary: `供应${label}的动脉闭塞约 ${occ}%。透壁缺血产生损伤电流，在 ${leads} 出现 ST 抬高。`,
        mechanism: [
          '冠脉闭塞切断心肌氧供。',
          'ATP 耗竭使 Na⁺/K⁺ 泵失效 → 损伤细胞无法充分复极。',
          '健康与损伤组织之间出现电压差（损伤电流）。',
          'ST 段期间，面向梗死区的导联基线被抬高。',
        ],
        ecgFindings: [
          `${leads} ST 段抬高${occ >= 60 ? '，可伴超急性 T 波' : ''}。`,
          '对侧面导联出现对应性 ST 压低。',
          occ >= 90
            ? '接近完全闭塞 — 需争分夺秒的 STEMI。'
            : '部分闭塞 — 抬高幅度随堵塞程度增加。',
        ],
        clinical: [
          '压榨性胸痛、出汗、恶心。',
          '肌钙蛋白 / 心肌标志物升高。',
          '需紧急再灌注（PCI 或溶栓）。',
        ],
      }
    },
  },
  hyperkalemia: {
    name: '高钾血症',
    category: '电解质',
    short: '血钾升高减慢传导并使 T 波高尖。',
    params: {
      heartRate: { label: '心率' },
      potassium: { label: '血清钾' },
    },
    explain: (v) => {
      const k = num(v, 'potassium', 4.2)
      const stage =
        k < 5.5 ? '正常/临界' : k < 6.5 ? '轻度' : k < 7.5 ? '中度' : '重度'
      return {
        summary: `血清 K⁺ ${k.toFixed(1)} mmol/L（${stage}）。细胞外钾升高降低钾浓度梯度，并使静息膜电位不稳定。`,
        mechanism: [
          '细胞外 K⁺ 升高降低跨膜钾浓度梯度。',
          '静息膜电位变浅（部分除极）。',
          '钠通道失活 → 除极与传导变慢。',
          '复极加快，形成高尖、基底窄的 T 波。',
        ],
        ecgFindings: [
          k >= 5.5 ? '高尖、基底窄的 T 波（最早征象）。' : '此水平 T 波仍大致正常。',
          k >= 6.5 ? 'QRS 增宽、PR 延长。' : 'QRS 仍窄。',
          k >= 7.5 ? 'P 波变平/消失 — 接近正弦波形态。' : 'P 波仍可见。',
        ],
        clinical: [
          '肌无力、感觉异常、心悸。',
          '严重时可致室颤 / 停搏。',
          '治疗：钙剂（膜稳定）、胰岛素/葡萄糖，并促进排钾。',
        ],
      }
    },
  },
  hypokalemia: {
    name: '低钾血症',
    category: '电解质',
    short: '血钾降低出现 U 波与 ST 压低。',
    params: {
      heartRate: { label: '心率' },
      potassium: { label: '血清钾' },
    },
    explain: (v) => {
      const k = num(v, 'potassium', 4.0)
      const stage =
        k >= 3.5 ? '正常' : k >= 3.0 ? '轻度' : k >= 2.5 ? '中度' : '重度'
      return {
        summary: `血清 K⁺ ${k.toFixed(1)} mmol/L（${stage}）。细胞外低钾延长复极并显现 U 波。`,
        mechanism: [
          '细胞外低钾增大跨膜钾梯度。',
          '复极钾电流反而减弱，复极延长。',
          '动作电位时程延长，T 波后出现明显 U 波。',
        ],
        ecgFindings: [
          k < 3.5 ? 'T 波低平。' : '此水平 T 波正常。',
          k < 3.5 ? 'T 波后明显 U 波。' : '无 U 波。',
          k < 3.0 ? 'ST 段压低，QU 间期延长。' : 'ST 段正常。',
        ],
        clinical: [
          '疲乏、肌痉挛、无力。',
          '有房性/室性心律失常风险（含尖端扭转型室速）。',
          '补钾，并检查镁。',
        ],
      }
    },
  },
  afib: {
    name: '心房颤动',
    category: '心血管',
    short: '混乱的心房活动伴不规则心室率。',
    params: {
      heartRate: { label: '平均心室率' },
    },
    explain: (v) => {
      const hr = num(v, 'heartRate', 110)
      return {
        summary: `心房颤动，平均心室率约 ${hr} 次/分。多个折返小波取代有组织的心房活动。`,
        mechanism: [
          '无序电激动小波在心房内持续折返。',
          '无单一协调的心房除极，故无 P 波。',
          '房室结受到不规则冲击并随机下传。',
          '形成绝对不规则的心室节律。',
        ],
        ecgFindings: [
          '不见清晰 P 波 — 代之以颤动（混乱）基线。',
          'R–R 间期绝对不规则。',
          'QRS 仍窄（心室传导正常）。',
        ],
        clinical: [
          '心悸、气促，亦可无症状。',
          '心房内血液淤滞增加卒中风险 → 抗凝。',
          '采用室率或节律控制策略。',
        ],
      }
    },
  },
  heart_block: {
    name: '房室传导阻滞',
    category: '传导',
    short: '心房与心室之间传导延迟或中断。',
    params: {
      heartRate: { label: '心率' },
      degree: {
        label: '阻滞程度',
        options: {
          first: '一度（PR 延长）',
          third: '三度（完全性）',
        },
      },
      pr: { label: 'PR 间期（一度）' },
    },
    explain: (v) => {
      const degree = str(v, 'degree', 'first')
      if (degree === 'third') {
        return {
          summary:
            '三度（完全性）房室阻滞。心房冲动无法下传心室；缓慢的心室逸搏节律独立起搏。',
          mechanism: [
            '房室结 / 希氏–浦肯野传导完全中断。',
            '心房仍由窦房结以自身频率发放。',
            '阻滞点以下的逸搏起搏点缓慢驱动心室。',
            '因此心房与心室完全分离。',
          ],
          ecgFindings: [
            'P 波与 QRS 各自独立行进（房室分离）。',
            '心房率快于缓慢的心室逸搏率。',
            '若逸搏灶位于心室，QRS 可增宽。',
          ],
          clinical: ['晕厥、乏力、低血压、心衰。', '常需植入永久起搏器。'],
        }
      }
      const pr = num(v, 'pr', 0.28)
      return {
        summary: `一度房室阻滞 — 每个 P 波均下传，但 PR 间期延长至 ${Math.round(pr * 1000)} ms。`,
        mechanism: [
          '房室结传导减慢但未中断。',
          '每个心房冲动仍能到达心室，只是更晚。',
        ],
        ecgFindings: [
          `固定延长的 PR 间期（> 200 ms；此处 ${Math.round(pr * 1000)} ms）。`,
          '1:1 关系 — 每个 P 后均有 QRS。',
          '窄 QRS，心室激动正常。',
        ],
        clinical: [
          '通常无症状且预后良好。',
          '可见于房室结阻滞药物或迷走张力增高。',
        ],
      }
    },
  },
}

export function localizedDiseaseName(
  id: string,
  fallback: string,
  locale: Locale,
): string {
  if (locale === 'zh') return DISEASE_UI_ZH[id]?.name ?? fallback
  return fallback
}

export function localizedCategory(
  id: string,
  fallback: string,
  locale: Locale,
): string {
  if (locale === 'zh') return DISEASE_UI_ZH[id]?.category ?? fallback
  return fallback
}

export function localizedParamLabel(
  diseaseId: string,
  key: string,
  fallback: string,
  locale: Locale,
): string {
  if (locale === 'zh') {
    return DISEASE_UI_ZH[diseaseId]?.params[key]?.label ?? fallback
  }
  return fallback
}

export function localizedOptionLabel(
  diseaseId: string,
  paramKey: string,
  value: string,
  fallback: string,
  locale: Locale,
): string {
  if (locale === 'zh') {
    return (
      DISEASE_UI_ZH[diseaseId]?.params[paramKey]?.options?.[value] ?? fallback
    )
  }
  return fallback
}

export function localizedExplain(
  diseaseId: string,
  fallback: (v: ParamValues) => Explanation,
  params: ParamValues,
  locale: Locale,
): Explanation {
  if (locale === 'zh') {
    const zh = DISEASE_UI_ZH[diseaseId]
    if (zh) return zh.explain(params)
  }
  return fallback(params)
}
