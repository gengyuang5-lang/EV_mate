"""
建筑物内部3D地图表示
使用3D网格来表示建筑物内部结构
"""
import numpy as np
from typing import Tuple, List, Optional


class BuildingMap:
    """建筑物内部3D地图类"""
    
    def __init__(self, width: int, height: int, depth: int):
        """
        初始化3D地图
        
        Args:
            width: X轴方向大小（单位：网格）
            height: Y轴方向大小（楼层高度，单位：网格）
            depth: Z轴方向大小（单位：网格）
        """
        self.width = width
        self.height = height
        self.depth = depth
        # 0表示可通行，1表示障碍物
        self.grid = np.zeros((width, height, depth), dtype=int)
        
    def set_obstacle(self, x: int, y: int, z: int):
        """设置障碍物"""
        if self.is_valid_position(x, y, z):
            self.grid[x, y, z] = 1
    
    def set_obstacle_region(self, x1: int, y1: int, z1: int, 
                           x2: int, y2: int, z2: int):
        """设置一个区域的障碍物"""
        for x in range(x1, min(x2 + 1, self.width)):
            for y in range(y1, min(y2 + 1, self.height)):
                for z in range(z1, min(z2 + 1, self.depth)):
                    self.set_obstacle(x, y, z)
    
    def set_walkable(self, x: int, y: int, z: int):
        """设置可通行区域"""
        if self.is_valid_position(x, y, z):
            self.grid[x, y, z] = 0
    
    def is_walkable(self, x: int, y: int, z: int) -> bool:
        """检查位置是否可通行"""
        if not self.is_valid_position(x, y, z):
            return False
        return self.grid[x, y, z] == 0
    
    def is_valid_position(self, x: int, y: int, z: int) -> bool:
        """检查位置是否有效"""
        return (0 <= x < self.width and 
                0 <= y < self.height and 
                0 <= z < self.depth)
    
    def add_stairs(self, x: int, z: int, start_floor: int, end_floor: int, 
                   direction: str = 'up'):
        """
        添加楼梯
        
        Args:
            x, z: 楼梯的X和Z坐标
            start_floor: 起始楼层
            end_floor: 结束楼层
            direction: 'up' 或 'down'
        """
        if direction == 'up':
            for y in range(start_floor, min(end_floor + 1, self.height)):
                self.set_walkable(x, y, z)
                # 楼梯周围也设为可通行
                for dx in [-1, 0, 1]:
                    for dz in [-1, 0, 1]:
                        if self.is_valid_position(x + dx, y, z + dz):
                            self.set_walkable(x + dx, y, z + dz)
        else:
            for y in range(end_floor, min(start_floor + 1, self.height)):
                self.set_walkable(x, y, z)
                for dx in [-1, 0, 1]:
                    for dz in [-1, 0, 1]:
                        if self.is_valid_position(x + dx, y, z + dz):
                            self.set_walkable(x + dx, y, z + dz)
    
    def add_elevator(self, x: int, z: int, floors: List[int]):
        """
        添加电梯
        
        Args:
            x, z: 电梯的X和Z坐标
            floors: 电梯服务的楼层列表
        """
        for y in floors:
            if self.is_valid_position(x, y, z):
                self.set_walkable(x, y, z)
                # 电梯周围设为可通行
                for dx in [-1, 0, 1]:
                    for dz in [-1, 0, 1]:
                        if self.is_valid_position(x + dx, y, z + dz):
                            self.set_walkable(x + dx, y, z + dz)
    
    def get_neighbors(self, x: int, y: int, z: int, 
                     allow_diagonal: bool = True) -> List[Tuple[int, int, int]]:
        """
        获取相邻的可通行位置
        
        Args:
            x, y, z: 当前位置
            allow_diagonal: 是否允许对角线移动（仅在同一楼层）
        
        Returns:
            可通行的相邻位置列表
        """
        neighbors = []
        
        # 同一楼层内的移动（6方向或26方向）
        directions = [
            (1, 0, 0), (-1, 0, 0),  # 前后
            (0, 0, 1), (0, 0, -1),  # 左右
            (0, 1, 0), (0, -1, 0),  # 上下楼层
        ]
        
        if allow_diagonal:
            # 添加对角线方向（仅水平方向）
            diagonal_directions = [
                (1, 0, 1), (1, 0, -1), (-1, 0, 1), (-1, 0, -1),
                (1, 1, 0), (1, -1, 0), (-1, 1, 0), (-1, -1, 0),
                (0, 1, 1), (0, 1, -1), (0, -1, 1), (0, -1, -1),
                (1, 1, 1), (1, 1, -1), (1, -1, 1), (1, -1, -1),
                (-1, 1, 1), (-1, 1, -1), (-1, -1, 1), (-1, -1, -1),
            ]
            directions.extend(diagonal_directions)
        
        for dx, dy, dz in directions:
            nx, ny, nz = x + dx, y + dy, z + dz
            if self.is_walkable(nx, ny, nz):
                neighbors.append((nx, ny, nz))
        
        return neighbors
    
    def visualize_2d_slice(self, y: int, show_path: Optional[List[Tuple[int, int, int]]] = None):
        """
        可视化某个楼层的2D切片
        
        Args:
            y: 楼层高度
            show_path: 可选，要显示的路径点列表
        """
        if y < 0 or y >= self.height:
            print(f"楼层 {y} 超出范围")
            return
        
        print(f"\n楼层 {y} 的俯视图 (X轴向右，Z轴向下):")
        print("  ", end="")
        for z in range(self.depth):
            print(f"{z:2}", end="")
        print()
        
        for x in range(self.width):
            print(f"{x:2}", end=" ")
            for z in range(self.depth):
                if show_path and (x, y, z) in show_path:
                    print(" *", end="")  # 路径点
                elif self.grid[x, y, z] == 1:
                    print(" #", end="")  # 障碍物
                else:
                    print(" .", end="")  # 可通行
            print()

