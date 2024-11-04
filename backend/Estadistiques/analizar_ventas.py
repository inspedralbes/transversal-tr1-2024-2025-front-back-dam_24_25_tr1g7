import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import json
import os
from datetime import datetime, timedelta

# Leer el archivo JSON
with open('dades_ventas.json', 'r') as f:
    dades = json.load(f)

data = pd.DataFrame(dades)

data['data'] = pd.to_datetime(data['data'])

data['total_venta'] = data['quantitat'] * data['preu_unitari']

general_output_dir = 'informes'
os.makedirs(general_output_dir, exist_ok=True)


fechas_con_ventas = data['data'].dt.date.unique()

for fecha in fechas_con_ventas:
    fecha_str = fecha.strftime('%Y-%m-%d')
    fecha_dir = os.path.join(general_output_dir, fecha_str)
    os.makedirs(fecha_dir, exist_ok=True)
    
    data_fecha = data[data['data'].dt.date == fecha]
    
    plt.figure(figsize=(12, 6))
    sns.barplot(data=data_fecha, x='producte', y='total_venta', estimator=sum, palette="Set2", edgecolor=None)
    plt.title(f'Vendes Totals per Producte - {fecha_str}')
    plt.xlabel('Producte')
    plt.ylabel('Total de Vendes')
    plt.tight_layout()
    plt.savefig(os.path.join(fecha_dir, f'vendes_per_producte_{fecha_str}.png'))
    plt.close()

data['semana_inicio'] = data['data'] - pd.to_timedelta(data['data'].dt.weekday, unit='D')
data['semana_fin'] = data['semana_inicio'] + pd.to_timedelta(6, unit='D')

ventas_semanales = data.groupby('semana_inicio')['total_venta'].sum().reset_index()
ventas_semanales['semana_fin'] = ventas_semanales['semana_inicio'] + pd.to_timedelta(6, unit='D')

weekly_output_dir = os.path.join(general_output_dir, 'semanales')
os.makedirs(weekly_output_dir, exist_ok=True)

plt.figure(figsize=(12, 6))
sns.lineplot(data=ventas_semanales, x='semana_inicio', y='total_venta', marker='o', color='blue')
plt.title('Vendes Totals Setmanals')
plt.xlabel('Semana (Inicio - Lunes)')
plt.ylabel('Total de Vendes')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig(os.path.join(weekly_output_dir, 'vendes_totals_setmanals.png'))
plt.close()

data['mes_inicio'] = data['data'].dt.to_period('M').dt.to_timestamp()

ventas_mensuales = data.groupby('mes_inicio')['total_venta'].sum().reset_index()

monthly_output_dir = os.path.join(general_output_dir, 'mensuales')
os.makedirs(monthly_output_dir, exist_ok=True)

plt.figure(figsize=(12, 6))
sns.lineplot(data=ventas_mensuales, x='mes_inicio', y='total_venta', marker='o', color='purple')
plt.title('Vendes Totals Mensuals')
plt.xlabel('Mes (Inicio)')
plt.ylabel('Total de Vendes')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig(os.path.join(monthly_output_dir, 'vendes_totals_mensuals.png'))
plt.close()

print("Gráficos generados: diarios guardados por día, gráfico semanal y gráfico mensual en sus carpetas respectivas.")
